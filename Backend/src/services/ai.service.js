const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().min(1).describe("The technical question that can be asked in the interview"),
        intention: z.string().min(1).describe("The intention of interviewer behind asking this question"),
        answer: z.string().min(1).describe("How to answer this question, what points to cover, what approach to take etc.")
    })).min(5).describe("At least 5 technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().min(1).describe("The behavioral question that can be asked in the interview"),
        intention: z.string().min(1).describe("The intention of interviewer behind asking this question"),
        answer: z.string().min(1).describe("How to answer this question, what points to cover, what approach to take etc.")
    })).min(3).describe("At least 3 behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().min(1).describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).min(3).describe("At least 3 skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().min(1).describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string().min(1)).min(2).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).min(7).describe("A 7-day preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().min(1).describe("The title of the job position, e.g. 'Full Stack Developer', 'Frontend Engineer' etc. This field must be named 'title'"),
})

const questionJsonSchema = {
    type: "object",
    properties: {
        question: { type: "string" },
        intention: { type: "string" },
        answer: { type: "string" }
    },
    required: [ "question", "intention", "answer" ]
}

const interviewReportJsonSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        matchScore: { type: "number", minimum: 0, maximum: 100 },
        technicalQuestions: {
            type: "array",
            minItems: 5,
            items: questionJsonSchema
        },
        behavioralQuestions: {
            type: "array",
            minItems: 3,
            items: questionJsonSchema
        },
        skillGaps: {
            type: "array",
            minItems: 3,
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: { type: "string", enum: [ "low", "medium", "high" ] }
                },
                required: [ "skill", "severity" ]
            }
        },
        preparationPlan: {
            type: "array",
            minItems: 7,
            maxItems: 7,
            items: {
                type: "object",
                properties: {
                    day: { type: "number" },
                    focus: { type: "string" },
                    tasks: {
                        type: "array",
                        minItems: 2,
                        items: { type: "string" }
                    }
                },
                required: [ "day", "focus", "tasks" ]
            }
        }
    },
    required: [ "title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan" ]
}

function buildInterviewReportPrompt({ resume, selfDescription, jobDescription, validationFeedback = "" }) {
    return `Generate a complete interview preparation report for this candidate.

Return ONLY valid JSON matching the provided schema.

Rules:
- title must be the exact job title from the job description.
- matchScore must be a number from 0 to 100.
- technicalQuestions must contain at least 5 detailed technical questions.
- behavioralQuestions must contain at least 3 detailed behavioral questions.
- skillGaps must contain at least 3 concrete skill gaps based on resume vs job description.
- preparationPlan must contain exactly 7 days.
- each preparationPlan day must contain at least 2 practical tasks.
- Do not return empty arrays.
- Do not omit any required field.

${validationFeedback ? `Previous response was invalid. Fix these issues and regenerate the full JSON:\n${validationFeedback}\n` : ""}
Candidate details:
Resume:
${resume || "No resume provided"}

Self Description:
${selfDescription || "No self description provided"}

Job Description:
${jobDescription}
`
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    let lastError
    let validationFeedback = ""

    for (let attempt = 1; attempt <= 2; attempt++) {
        const prompt = buildInterviewReportPrompt({
            resume,
            selfDescription,
            jobDescription,
            validationFeedback
        })

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: interviewReportJsonSchema,
            }
        })

        console.log("AI RAW RESPONSE:", response.text)

        try {
            const jsonContent = JSON.parse(response.text)
            const parsedReport = interviewReportSchema.safeParse(jsonContent)

            if (parsedReport.success) {
                return parsedReport.data
            }

            lastError = parsedReport.error
            validationFeedback = parsedReport.error.issues
                .map((issue) => `${issue.path.join(".") || "response"}: ${issue.message}`)
                .join("\n")
            console.error("AI REPORT VALIDATION ERROR:", parsedReport.error.issues)
        } catch (err) {
            lastError = err
            validationFeedback = err.message
            console.error("AI REPORT JSON PARSE ERROR:", err)
        }
    }

    throw new Error(`AI returned an incomplete interview report. ${lastError?.message || ""}`)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })
    const resumePdfJsonSchema = {
        type: "object",
        properties: {
            html: { type: "string" }
        },
        required: [ "html" ]
    }

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: resumePdfJsonSchema,
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }
