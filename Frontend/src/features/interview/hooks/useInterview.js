import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, resumeLoading, setResumeLoading, report, setReport, reports, setReports } = context

   const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)
    let response = null
    try {
        response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
        setReport(response.interviewReport)
    } catch (error) {
        console.log(error)
    } finally {
        setLoading(false)
    }

    return response?.interviewReport ?? null  
}

    const getReportById = async (interviewId) => {
    setLoading(true)
    let response = null
    try {
        response = await getInterviewReportById(interviewId)
        setReport(response.interviewReport)
    } catch (error) {
        console.log(error)
    } finally {
        setLoading(false)
    }

    return response?.interviewReport ?? null
}

const getReports = async () => {
    setLoading(true)
    let response = null
    try {
        response = await getAllInterviewReports()
        setReports(response.interviewReports)
    } catch (error) {
        console.log(error)
    } finally {
        setLoading(false)
    }

    return response?.interviewReports ?? []
}

    const getResumePdf = async (interviewReportId) => {
        setResumeLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.log(error)
        } finally {
            setResumeLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, resumeLoading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
