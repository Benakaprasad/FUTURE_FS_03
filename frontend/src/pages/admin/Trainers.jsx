import { useState, useEffect, useCallback } from "react";
import DashLayout from "../../components/DashLayout";
import { DataTable, Badge, Toast } from "../../components/AdminUi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME    || "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET";

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "fitzone/trainer-docs");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id, resource_type: data.resource_type };
}

function FileUploadZone({ onUploaded, existingFiles = [] }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles]         = useState(existingFiles);
  const [dragOver, setDragOver]   = useState(false);
  const [error, setError]         = useState("");

  const handleFiles = async (fileList) => {
    setError("");
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    const toUpload = Array.from(fileList).filter(f => {
      if (!allowed.includes(f.type)) { setError(`${f.name}: Only JPG, PNG, WEBP, PDF`); return false; }
      if (f.size > 5*1024*1024)      { setError(`${f.name}: Max 5MB`); return false; }
      return true;
    });
    if (!toUpload.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(toUpload.map(uploadToCloudinary));
      const updated = [...files, ...results];
      setFiles(updated);
      onUploaded(updated);
    } catch { setError("Upload failed. Check Cloudinary config."); }
    finally { setUploading(false); }
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    onUploaded(updated);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById("fz-cert-input").click()}
        style={{ border:`2px dashed ${dragOver?"#FF1A1A":"rgba(255,255,255,0.12)"}`, borderRadius:"12px", padding:"2rem", textAlign:"center", cursor:uploading?"wait":"pointer", background:dragOver?"rgba(255,26,26,0.05)":"rgba(255,255,255,0.02)", transition:"all 0.2s" }}
      >
        <input id="fz-cert-input" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" style={{display:"none"}} onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <><div style={{width:"32px",height:"32px",border:"3px solid rgba(255,26,26,0.2)",borderTop:"3px solid #FF1A1A",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 0.75rem"}}/><p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.875rem"}}>Uploading...</p></>
        ) : (
          <><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📎</div><p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.875rem",marginBottom:"4px"}}>Drag & drop or <span style={{color:"#FF1A1A",fontWeight:700}}>click to upload</span></p><p style={{color:"rgba(255,255,255,0.25)",fontSize:"11px"}}>JPG, PNG, WEBP, PDF · Max 5MB each</p></>
        )}
      </div>
      {error && <p style={{fontSize:"12px",color:"#FF1A1A",marginTop:"6px"}}>⚠️ {error}</p>}
      {files.length > 0 && (
        <div style={{marginTop:"0.75rem",display:"flex",flexDirection:"column",gap:"6px"}}>
          {files.map((f, i) => {
            const isImage = f.resource_type==="image" || /\.(jpg|jpeg|png|webp)/i.test(f.url||"");
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"8px",padding:"8px 12px"}}>
                {isImage
                  ? <img src={f.url} alt="" style={{width:"36px",height:"36px",borderRadius:"6px",objectFit:"cover"}}/>
                  : <div style={{width:"36px",height:"36px",borderRadius:"6px",background:"rgba(255,26,26,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>📄</div>
                }
                <a href={f.url} target="_blank" rel="noopener noreferrer" style={{flex:1,fontSize:"12px",color:"rgba(255,255,255,0.6)",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {f.public_id?.split("/").pop() || `File ${i+1}`}
                </a>
                <button onClick={() => removeFile(i)} style={{background:"none",border:"none",color:"rgba(255,26,26,0.5)",cursor:"pointer",fontSize:"14px",padding:"2px 6px"}}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrainerDetailModal({ trainer, onClose, onApprove, onReject, canManage }) {
  const [tab,        setTab]        = useState("profile");
  const [certFiles,  setCertFiles]  = useState(() => { try { return JSON.parse(trainer.certification_urls||"[]"); } catch { return []; } });
  const [saving,     setSaving]     = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  const isInactive = trainer.status === "inactive";
  const isActive   = trainer.status === "active";

  const statusColor = { active:"#22C55E", inactive:"#FFB800", on_leave:"#FF1A1A" }[trainer.status] || "#fff";

  const handleApprove = async () => { setSaving(true); try { await onApprove(trainer.id); onClose(); } finally { setSaving(false); } };
  const handleReject  = async () => { setSaving(true); try { await onReject(trainer.id, rejectNote); onClose(); } finally { setSaving(false); } };

  const handleSaveDocs = async () => {
    setSaving(true);
    try { await api.patch(`/trainers/${trainer.id}`, { certification_urls: JSON.stringify(certFiles) }); }
    finally { setSaving(false); }
  };

  const Field = ({ label, value, accent }) => (
    <div style={{marginBottom:"1rem"}}>
      <p style={{fontSize:"10px",fontWeight:800,letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>{label}</p>
      <p style={{fontSize:"0.9rem",color:accent||"rgba(255,255,255,0.75)",lineHeight:1.5}}>
        {value || <span style={{color:"rgba(255,255,255,0.2)"}}>Not provided</span>}
      </p>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000,backdropFilter:"blur(6px)",padding:"1rem"}}>
      <div style={{background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",width:"100%",maxWidth:"640px",maxHeight:"90vh",display:"flex",flexDirection:"column",animation:"fadeUp 0.3s ease forwards",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"1.5rem 2rem",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:"1rem",flexShrink:0}}>
          <div style={{width:"52px",height:"52px",borderRadius:"12px",flexShrink:0,background:"linear-gradient(135deg,#FF1A1A22,#FF1A1A08)",border:"1px solid rgba(255,26,26,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",color:"#FF1A1A"}}>
            {(trainer.full_name||trainer.username||"T")[0].toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:"2px",color:"#fff"}}>{trainer.full_name||trainer.username||"—"}</h2>
              <span style={{fontSize:"10px",fontWeight:800,letterSpacing:"1px",padding:"3px 10px",borderRadius:"100px",background:statusColor+"15",color:statusColor,border:`1px solid ${statusColor}30`}}>
                {trainer.status==="inactive"?"PENDING":trainer.status?.toUpperCase()}
              </span>
            </div>
            <p style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.35)"}}>@{trainer.username} · {trainer.email}</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"1.2rem",cursor:"pointer",padding:"4px 8px",flexShrink:0}}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
          {[{id:"profile",label:"👤 Profile"},{id:"docs",label:"📎 Documents"},...(canManage?[{id:"actions",label:"⚡ Actions"}]:[])].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{padding:"12px 20px",background:"none",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:tab===t.id?"#fff":"rgba(255,255,255,0.35)",borderBottom:`2px solid ${tab===t.id?"#FF1A1A":"transparent"}`,transition:"all 0.2s"}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{overflowY:"auto",flex:1,padding:"1.75rem 2rem"}}>

          {tab === "profile" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 2rem"}}>
                <Field label="SPECIALIZATION"  value={trainer.specialization} accent="#FF1A1A"/>
                <Field label="EXPERIENCE"      value={trainer.experience_years?`${trainer.experience_years} years`:null}/>
                <Field label="PHONE"           value={trainer.phone}/>
                <Field label="HOURLY RATE"     value={trainer.hourly_rate?`₹${trainer.hourly_rate}/hr`:null}/>
                <Field label="AVAILABILITY"    value={trainer.availability}/>
                <Field label="CURRENT CLIENTS" value={trainer.current_clients??0}/>
              </div>
              <div style={{marginBottom:"1rem"}}>
                <p style={{fontSize:"10px",fontWeight:800,letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>CERTIFICATIONS</p>
                <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"10px",padding:"12px 14px"}}>
                  <p style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>{trainer.certifications||<span style={{color:"rgba(255,255,255,0.2)"}}>None listed</span>}</p>
                </div>
              </div>
              <div style={{marginBottom:"1rem"}}>
                <p style={{fontSize:"10px",fontWeight:800,letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"4px"}}>BIO</p>
                <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"10px",padding:"12px 14px"}}>
                  <p style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>{trainer.bio||<span style={{color:"rgba(255,255,255,0.2)"}}>No bio provided</span>}</p>
                </div>
              </div>
              <div>
                <p style={{fontSize:"10px",fontWeight:800,letterSpacing:"2px",color:"rgba(255,255,255,0.3)",marginBottom:"8px"}}>REGISTRATION INFO</p>
                <div style={{display:"flex",gap:"1rem",flexWrap:"wrap"}}>
                  {[
                    {label:"Joined",  value:trainer.registered_at?new Date(trainer.registered_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"—"},
                    {label:"User ID", value:`#${trainer.user_id||trainer.id}`},
                  ].map((item,i) => (
                    <div key={i} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",padding:"8px 14px"}}>
                      <p style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"2px"}}>{item.label}</p>
                      <p style={{fontSize:"0.8rem",fontWeight:700,color:"rgba(255,255,255,0.7)"}}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "docs" && (
            <div>
              <p style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.4)",lineHeight:1.6,marginBottom:"1rem"}}>
                Upload or review certificates, ID proof, and documents submitted by this trainer.
              </p>
              <FileUploadZone existingFiles={certFiles} onUploaded={setCertFiles}/>
              {certFiles.length > 0 && canManage && (
                <button onClick={handleSaveDocs} disabled={saving} style={{marginTop:"1rem",padding:"10px 20px",background:"linear-gradient(135deg,#FF1A1A,#cc0000)",color:"#fff",fontWeight:700,fontSize:"13px",border:"none",borderRadius:"8px",cursor:"pointer",opacity:saving?0.6:1,fontFamily:"'DM Sans',sans-serif"}}>
                  {saving?"Saving...":"Save Documents"}
                </button>
              )}
              {certFiles.length===0 && <div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.2)",fontSize:"0.875rem"}}>No documents uploaded yet</div>}
            </div>
          )}

          {tab === "actions" && canManage && (
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              {isInactive && (
                <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:"12px",padding:"1.25rem"}}>
                  <p style={{fontWeight:800,color:"#22C55E",marginBottom:"6px",fontSize:"0.9rem"}}>✅ Approve Trainer</p>
                  <p style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",lineHeight:1.6,marginBottom:"1rem"}}>Grants full dashboard access. Review certifications before approving.</p>
                  <button onClick={handleApprove} disabled={saving} style={{padding:"12px 24px",background:"linear-gradient(135deg,#22C55E,#16a34a)",color:"#fff",fontWeight:700,fontSize:"0.9rem",border:"none",borderRadius:"8px",cursor:"pointer",opacity:saving?0.6:1,fontFamily:"'DM Sans',sans-serif"}}>
                    {saving?"Approving...":"Approve & Grant Access →"}
                  </button>
                </div>
              )}

              <div style={{background:"rgba(255,26,26,0.05)",border:"1px solid rgba(255,26,26,0.2)",borderRadius:"12px",padding:"1.25rem"}}>
                <p style={{fontWeight:800,color:"#FF1A1A",marginBottom:"6px",fontSize:"0.9rem"}}>{isActive?"🚫 Revoke Access":"❌ Reject Application"}</p>
                <p style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",lineHeight:1.6,marginBottom:"1rem"}}>
                  {isActive?"Trainer loses dashboard access but account remains.":"Application rejected — trainer sees rejection message on login."}
                </p>
                {!showReject ? (
                  <button onClick={() => setShowReject(true)} style={{padding:"12px 24px",background:"rgba(255,26,26,0.1)",color:"#FF1A1A",fontWeight:700,fontSize:"0.9rem",border:"1px solid rgba(255,26,26,0.3)",borderRadius:"8px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    {isActive?"Revoke Access":"Reject Application"}
                  </button>
                ) : (
                  <div>
                    <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Optional: reason for rejection" rows={3}
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,26,26,0.2)",borderRadius:"8px",padding:"12px",color:"#fff",fontSize:"0.875rem",fontFamily:"'DM Sans',sans-serif",resize:"vertical",outline:"none",marginBottom:"10px"}}/>
                    <div style={{display:"flex",gap:"8px"}}>
                      <button onClick={() => setShowReject(false)} style={{padding:"10px 20px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif",fontSize:"0.875rem"}}>Cancel</button>
                      <button onClick={handleReject} disabled={saving} style={{padding:"10px 20px",background:"linear-gradient(135deg,#FF1A1A,#cc0000)",color:"#fff",fontWeight:700,border:"none",borderRadius:"8px",cursor:"pointer",opacity:saving?0.6:1,fontFamily:"'DM Sans',sans-serif",fontSize:"0.875rem"}}>
                        {saving?"Processing...":"Confirm Rejection"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminTrainers() {
  const { user }     = useAuth();
  const [trainers,   setTrainers]   = useState([]);
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [modal,      setModal]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [assignForm, setAssignForm] = useState({ trainer_id:"", member_id:"" });

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/trainers"), api.get("/members?status=active")])
      .then(([tr,mem]) => { setTrainers(tr.data.trainers||[]); setMembers(mem.data.members||[]); })
      .catch(() => showToast("Failed to load.","error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (id) => {
    await api.patch(`/trainers/${id}/approve`);
    showToast("Trainer approved! Full access granted.");
    fetchAll();
  };

  const handleReject = async (id, note) => {
    await api.patch(`/trainers/${id}/reject`, { notes: note });
    showToast("Application rejected.");
    fetchAll();
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post("/assignments", assignForm);
      showToast("Trainer assigned successfully.");
      setModal(null); fetchAll();
    } catch (err) { showToast(err.response?.data?.error||"Assignment failed.","error"); }
  };

  const canManage    = ["admin","manager"].includes(user?.role);
  const pendingCount = trainers.filter(t => t.status==="inactive").length;

  const cols = [
    { key:"full_name", label:"Name", render:(r) => (
      <button onClick={() => { setSelected(r); setModal({type:"detail"}); }}
        style={{background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
        <span style={{color:"#fff",fontWeight:700,fontSize:"0.875rem",borderBottom:"1px solid rgba(255,26,26,0.3)"}}>
          {r.full_name||r.username||"—"}
        </span>
      </button>
    )},
    { key:"specialization",  label:"Specialization", render:(r) => r.specialization||<span style={{color:"rgba(255,255,255,0.2)"}}>—</span> },
    { key:"certifications",  label:"Certifications", render:(r) => r.certifications
      ? <span style={{fontSize:"12px",maxWidth:"150px",display:"inline-block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.certifications}</span>
      : <span style={{color:"rgba(255,255,255,0.2)"}}>—</span>
    },
    { key:"experience_years", label:"Exp.", render:(r) => r.experience_years?`${r.experience_years}y`:<span style={{color:"rgba(255,255,255,0.2)"}}>—</span> },
    { key:"current_clients",  label:"Members", render:(r) => <span style={{color:"#00C2FF",fontWeight:700}}>{r.current_clients??0}</span> },
    { key:"status", label:"Status", render:(r) => {
      const cm = {active:{color:"#22C55E",bg:"#22C55E15",border:"#22C55E30"},inactive:{color:"#FFB800",bg:"#FFB80015",border:"#FFB80030"},on_leave:{color:"#FF1A1A",bg:"#FF1A1A15",border:"#FF1A1A30"}};
      const c  = cm[r.status]||{color:"#fff",bg:"#fff08",border:"#fff15"};
      return <span style={{fontSize:"10px",fontWeight:800,letterSpacing:"1px",padding:"3px 9px",borderRadius:"100px",background:c.bg,color:c.color,border:`1px solid ${c.border}`}}>{r.status==="inactive"?"PENDING":r.status?.toUpperCase()}</span>;
    }},
  ];

  return (
    <DashLayout
      title="TRAINERS"
      subtitle={`Manage trainers${pendingCount>0?` · ${pendingCount} pending approval`:""}`}
      actions={canManage && (
        <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
          {pendingCount > 0 && (
            <span style={{background:"rgba(255,183,0,0.1)",border:"1px solid rgba(255,183,0,0.3)",borderRadius:"100px",padding:"6px 14px",fontSize:"12px",fontWeight:800,color:"#FFB700"}}>
              ⏳ {pendingCount} Pending
            </span>
          )}
          <button onClick={() => { setAssignForm({trainer_id:"",member_id:""}); setModal({type:"assign"}); }} style={ts.addBtn}>
            + Assign Trainer
          </button>
        </div>
      )}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg);}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}} @keyframes slideIn{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}} select:focus{outline:none;}`}</style>

      <DataTable cols={cols} rows={trainers} loading={loading}
        searchKeys={["full_name","specialization","certifications","username"]}
        filterKey="status"
        filterOptions={[{value:"active",label:"Active"},{value:"inactive",label:"Pending"},{value:"on_leave",label:"Rejected"}]}
        emptyText="No trainers yet."
        actions={canManage?(row) => (
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={() => { setSelected(row); setModal({type:"detail"}); }} style={ts.viewBtn}>View</button>
            {row.status==="inactive" && <button onClick={() => handleApprove(row.id)} style={ts.approveBtn}>Approve</button>}
            {row.status==="active"   && <button onClick={async()=>{ await api.patch(`/trainers/${row.id}/reject`); showToast("Access revoked."); fetchAll(); }} style={ts.deactivateBtn}>Revoke</button>}
          </div>
        ):undefined}
      />

      {modal?.type==="detail" && selected && (
        <TrainerDetailModal trainer={selected} canManage={canManage}
          onClose={() => { setModal(null); setSelected(null); }}
          onApprove={handleApprove} onReject={handleReject}
        />
      )}

      {modal?.type==="assign" && (
        <div style={ts.overlay}>
          <div style={ts.modal}>
            <div style={ts.modalHeader}>
              <h3 style={ts.modalTitle}>ASSIGN TRAINER</h3>
              <button onClick={() => setModal(null)} style={ts.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleAssign} style={ts.form}>
              <div style={ts.field}>
                <label style={ts.label}>Select Trainer</label>
                <select required value={assignForm.trainer_id} onChange={(e)=>setAssignForm(p=>({...p,trainer_id:e.target.value}))} style={ts.select}>
                  <option value="">— Choose trainer —</option>
                  {trainers.filter(t=>t.status==="active").map(t=>(
                    <option key={t.id} value={t.id}>{t.full_name||t.username} · {t.specialization||"General"} ({t.current_clients||0} members)</option>
                  ))}
                </select>
              </div>
              <div style={ts.field}>
                <label style={ts.label}>Select Member</label>
                <select required value={assignForm.member_id} onChange={(e)=>setAssignForm(p=>({...p,member_id:e.target.value}))} style={ts.select}>
                  <option value="">— Choose member —</option>
                  {members.map(m=><option key={m.id} value={m.id}>{m.customer_name} — {m.plan_type}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:"0.75rem"}}>
                <button type="button" onClick={()=>setModal(null)} style={ts.cancelBtn}>Cancel</button>
                <button type="submit" style={ts.saveBtn}>Assign →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast}/>
    </DashLayout>
  );
}

const ts = {
  addBtn:       {padding:"10px 20px",background:"linear-gradient(135deg,#FF1A1A,#cc0000)",color:"#fff",fontWeight:700,fontSize:"13px",border:"none",borderRadius:"8px",cursor:"pointer",boxShadow:"0 4px 15px rgba(255,26,26,0.3)",fontFamily:"'DM Sans',sans-serif"},
  viewBtn:      {padding:"6px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"6px",color:"rgba(255,255,255,0.7)",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  approveBtn:   {padding:"6px 14px",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:"6px",color:"#22C55E",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  deactivateBtn:{padding:"6px 14px",background:"rgba(255,26,26,0.08)",border:"1px solid rgba(255,26,26,0.2)",borderRadius:"6px",color:"#FF1A1A",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  overlay:      {position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000,backdropFilter:"blur(4px)"},
  modal:        {background:"#0d0d0d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",maxWidth:"480px",width:"90%",animation:"fadeUp 0.3s ease forwards",overflow:"hidden"},
  modalHeader:  {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",borderBottom:"1px solid rgba(255,255,255,0.06)"},
  modalTitle:   {fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:"3px",color:"#fff"},
  closeBtn:     {background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:"18px",cursor:"pointer",padding:"4px"},
  form:         {padding:"1.75rem 2rem",display:"flex",flexDirection:"column",gap:"1.25rem"},
  field:        {display:"flex",flexDirection:"column",gap:"7px"},
  label:        {fontSize:"11px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(255,255,255,0.4)"},
  select:       {width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"8px",padding:"12px 14px",color:"#fff",fontSize:"0.875rem",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"},
  cancelBtn:    {flex:"0 0 auto",padding:"12px 24px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"rgba(255,255,255,0.5)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"},
  saveBtn:      {flex:1,padding:"12px",background:"linear-gradient(135deg,#FF1A1A,#cc0000)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:700,border:"none",borderRadius:"8px",cursor:"pointer"},
};