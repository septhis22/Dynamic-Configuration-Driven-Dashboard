import React, { useState } from 'react';

export default function CompetencyTester() {
  // --- State for POST Request ---
  const defaultJson = `{
  "student_id": "abc-123",
  "exam_type": "IELTS",
  "batch_id": "batch-2026-kerala",
  "skill": "speaking",
  "sub_skill": "pronunciation",
  "new_score": 5.0,
  "session_type": "drill"
}`;

  const [postJson, setPostJson] = useState(defaultJson);
  const [postResponse, setPostResponse] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [jsonError, setJsonError] = useState('');

  // --- State for GET Request ---
  const [getStudentId, setGetStudentId] = useState('abc-123');
  const [getExamType, setGetExamType] = useState('IELTS');
  const [getBatchId, setGetBatchId] = useState('batch-2026-kerala');
  const [getResponse, setGetResponse] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  // --- Handlers ---
  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError('');
    setPostResponse(null);
    
    // Validate JSON before sending
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(postJson);
    } catch (err) {
      setJsonError('Invalid JSON format. Please check your syntax.');
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch('https://competency-matrix-calculator-production.up.railway.app/api/update-competency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPayload),
      });
      const data = await res.json();
      setPostResponse({ status: res.status, data });
    } catch (error: any) {
      setPostResponse({ error: error.message });
    } finally {
      setIsPosting(false);
    }
  };

  const submitGet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFetching(true);
    setGetResponse(null);
    try {
      const url = new URL(`https://competency-matrix-calculator-production.up.railway.app/api/competency/${getStudentId}`);
      url.searchParams.append('exam_type', getExamType);
      url.searchParams.append('batch_id', getBatchId);

      const res = await fetch(url.toString());
      const data = await res.json();
      setGetResponse({ status: res.status, data });
    } catch (error: any) {
      setGetResponse({ error: error.message });
    } finally {
      setIsFetching(false);
    }
  };

  // --- Styles ---
  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    card: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', background: '#fefefe' },
    formGroup: { marginBottom: '12px', display: 'flex', flexDirection: 'column' as const },
    label: { marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' },
    input: { padding: '8px', borderRadius: '4px', border: '1px solid #aaa', fontSize: '14px' },
    textarea: { padding: '8px', borderRadius: '4px', border: '1px solid #aaa', fontSize: '13px', fontFamily: 'monospace', minHeight: '200px', resize: 'vertical' as const },
    button: { padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    pre: { background: '#1e1e1e', color: '#d4d4d4', padding: '15px', borderRadius: '4px', overflowX: 'auto' as const, fontSize: '13px', maxHeight: '400px' },
    error: { color: 'red', fontSize: '13px', marginTop: '5px' }
  };

  return (
    <div style={styles.container}>
      <h2>Competency API Tester</h2>
      
      <div style={styles.grid}>
        {/* --- POST SECTION --- */}
        <div style={styles.card}>
          <h3>1. Update Competency (POST)</h3>
          <form onSubmit={submitPost}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Raw JSON Payload</label>
              <textarea 
                style={styles.textarea} 
                value={postJson} 
                onChange={(e) => setPostJson(e.target.value)} 
              />
              {jsonError && <div style={styles.error}>{jsonError}</div>}
            </div>

            <button type="submit" style={styles.button} disabled={isPosting}>
              {isPosting ? 'Sending...' : 'Send POST Request'}
            </button>
          </form>

          {postResponse && (
            <div style={{ marginTop: '20px' }}>
              <h4>Response Output</h4>
              <pre style={styles.pre}>{JSON.stringify(postResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* --- GET SECTION --- */}
        <div style={styles.card}>
          <h3>2. Fetch Matrix (GET)</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Fetches aggregated data from the matrix table.</p>
          <form onSubmit={submitGet}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Student ID</label>
              <input style={styles.input} value={getStudentId} onChange={(e) => setGetStudentId(e.target.value)} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Exam Type</label>
              <input style={styles.input} value={getExamType} onChange={(e) => setGetExamType(e.target.value)} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Batch ID</label>
              <input style={styles.input} value={getBatchId} onChange={(e) => setGetBatchId(e.target.value)} required />
            </div>
            <button type="submit" style={styles.button} disabled={isFetching}>
              {isFetching ? 'Fetching...' : 'Fetch GET Request'}
            </button>
          </form>

          {getResponse && (
            <div style={{ marginTop: '20px' }}>
              <h4>Response Output</h4>
              <pre style={styles.pre}>{JSON.stringify(getResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}