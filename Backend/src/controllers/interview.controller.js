const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterviewReportController(req, res){
const resumeFile = req.file

const resumeContent = pdfParse(req.file.buffer)
const { selfDescription, jobDescription } = req.body

const interviewreportByAi = await generateInterviewReport({
    resume: resumeContent,
    selfDescription,
    jobDescription
})

const interviewReport = await interviewReportModel.create({
    user: req.user.id
})

}

module.exports = { generateInterviewReportController }