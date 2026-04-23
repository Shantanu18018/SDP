import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axiosInstance from "../lib/axios";
import { UploadIcon, BrainCircuitIcon, CheckCircle2Icon, AlertCircleIcon, FileTextIcon } from "lucide-react";
import toast from "react-hot-toast";

function AtsModal() {
  const { isSignedIn } = useAuth();
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setResume(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) return toast.error("Please upload your resume");
    if (!jobDescription) return toast.error("Please paste the job description");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await axiosInstance.post("/ats/evaluate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(response.data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to analyze resume. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    document.getElementById('ats_modal').close();
    // Optional: reset state on close
    // setResume(null);
    // setJobDescription("");
    // setResult(null);
  };

  return (
    <dialog id="ats_modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl bg-base-100 p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-base-300 bg-base-200/50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-secondary/20 rounded-xl flex items-center justify-center">
              <BrainCircuitIcon className="size-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-secondary">AI Resume Analysis</h3>
              <p className="text-xs text-base-content/60">Powered by InterVueX ATS Engine</p>
            </div>
          </div>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost">✕</button>
          </form>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {!isSignedIn ? (
            <div className="text-center py-12">
              <AlertCircleIcon className="size-16 text-warning mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">Sign in Required</h3>
              <p className="text-base-content/70">You need to be signed in to use the AI Resume Analysis feature.</p>
              <form method="dialog" className="mt-6">
                 <button className="btn btn-primary">Got it</button>
              </form>
            </div>
          ) : result && result.ats_score ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Result View */}
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">{result?.candidate_name || "Unknown Candidate"}</h2>
                <div className="badge badge-primary badge-lg">{result?.job_title_applied || "Role"}</div>
              </div>

              {/* Scores */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body">
                    <h3 className="card-title text-sm uppercase text-base-content/50">ATS Score</h3>
                    <div className="flex items-end gap-4">
                      <div className="text-6xl font-black text-primary">{result?.ats_score?.score || 0}</div>
                      <div className="pb-2">
                        <div className="badge badge-primary">{result?.ats_score?.label || "N/A"}</div>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{result?.ats_score?.reasoning}</p>
                  </div>
                </div>
                
                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body">
                    <h3 className="card-title text-sm uppercase text-base-content/50">Job Fit</h3>
                    <div className="flex items-end gap-4">
                      <div className="text-6xl font-black text-secondary">{result?.job_fit?.score || 0}</div>
                      <div className="pb-2">
                        <div className="badge badge-secondary">{result?.job_fit?.label || "N/A"}</div>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{result?.job_fit?.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h3 className="font-bold flex items-center gap-2">
                     <CheckCircle2Icon className="size-5 text-success" />
                     Matched Skills
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {(Array.isArray(result?.matched_skills) ? result.matched_skills : []).map(skill => (
                       <div key={skill} className="badge badge-success badge-outline">{skill}</div>
                     ))}
                     {(!Array.isArray(result?.matched_skills) || result.matched_skills.length === 0) && <span className="text-sm text-base-content/50">No explicitly matched skills found.</span>}
                   </div>
                   
                   <h3 className="font-bold flex items-center gap-2 mt-6">
                     <SparklesIcon className="size-5 text-accent" />
                     Bonus Skills
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {(Array.isArray(result?.bonus_skills) ? result.bonus_skills : []).map(skill => (
                       <div key={skill} className="badge badge-accent badge-outline">{skill}</div>
                     ))}
                     {(!Array.isArray(result?.bonus_skills) || result.bonus_skills.length === 0) && <span className="text-sm text-base-content/50">None identified.</span>}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold flex items-center gap-2">
                     <AlertCircleIcon className="size-5 text-error" />
                     Missing Skills
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {(Array.isArray(result?.missing_skills) ? result.missing_skills : []).map(skill => (
                       <div key={skill} className="badge badge-error badge-outline">{skill}</div>
                     ))}
                     {(!Array.isArray(result?.missing_skills) || result.missing_skills.length === 0) && <span className="text-sm text-base-content/50">Candidate meets all listed skill requirements!</span>}
                   </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Interviewer Verdict */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                <h3 className="font-bold text-lg text-primary mb-2">Interviewer Verdict</h3>
                <p className="text-base-content/90">{result?.interviewer_verdict || "No verdict provided."}</p>
              </div>
              
              {/* Recommended Questions */}
              {(Array.isArray(result?.suggested_interview_questions) ? result.suggested_interview_questions : []).length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Suggested Interview Questions</h3>
                  <ul className="space-y-3">
                    {(Array.isArray(result?.suggested_interview_questions) ? result.suggested_interview_questions : []).map((q, i) => (
                      <li key={i} className="flex gap-3 bg-base-200 p-4 rounded-lg">
                        <span className="font-bold text-primary">{i+1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-4">
                 <button className="btn btn-outline" onClick={() => setResult(null)}>Analyze Another</button>
              </div>

            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4 p-6 border-2 border-dashed border-base-300 rounded-2xl hover:border-primary hover:bg-base-200/50 transition-colors">
                  <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    {resume ? <FileTextIcon className="size-7 text-primary" /> : <UploadIcon className="size-7 text-primary" />}
                  </div>
                  <div>
                    <span className="label-text text-lg font-bold block">Upload Resume (PDF)</span>
                    <span className="text-sm text-base-content/60">
                      {resume ? resume.name : "Click to select a file or drag and drop"}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Job Description</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-48 focus:border-secondary focus:ring-1 focus:ring-secondary text-base" 
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-action m-0 pt-4">
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-secondary text-white w-40"
                  disabled={loading}
                >
                  {loading ? <span className="loading loading-spinner"></span> : "Analyze Candidate"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={loading}>close</button>
      </form>
    </dialog>
  );
}

// Quick inline component since SparklesIcon was missing import
function SparklesIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  );
}

export default AtsModal;
