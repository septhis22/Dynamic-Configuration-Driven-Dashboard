import React, { useState } from 'react';

type InputMode = 'form' | 'json';

export default function CompetencyTester() {
  // --- Example Placeholders (Light background text) ---
  const postPlaceholder = `{
  "student_id": "abc-123",
  "exam_type": "IELTS",
  "batch_id": "batch-2026-kerala",
  "skill": "speaking",
  "sub_skill": "pronunciation",
  "new_score": 5.0,
  "session_type": "drill"
}`;

  const getPlaceholder = `{
  "student_id": "abc-123",
  "exam_type": "IELTS",
  "batch_id": "batch-2026-kerala"
}`;

  // --- POST State ---
  const [postMode, setPostMode] = useState<InputMode>('json');
  const [postForm, setPostForm] = useState({
    student_id: '',
    exam_type: '',
    batch_id: '',
    skill: '',
    sub_skill: '',
    new_score: '' as number | '',
    session_type: 'drill',
  });
  const [postJson, setPostJson] = useState(''); 
  const [postResponse, setPostResponse] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');

  // --- GET State ---
  const [getMode, setGetMode] = useState<InputMode>('json');
  const [getForm, setGetForm] = useState({
    student_id: '',
    exam_type: '',
    batch_id: '',
  });
  const [getJson, setGetJson] = useState(''); 
  const [getResponse, setGetResponse] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [getError, setGetError] = useState('');

  // --- Handlers ---
  const handlePostFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPostForm(prev => ({
      ...prev,
      [name]: name === 'new_score' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleGetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGetForm(prev => ({ ...prev, [name]: value }));
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    setPostResponse(null);
    
    let payload;
    if (postMode === 'json') {
      try {
        payload = JSON.parse(postJson);
      } catch (err) {
        setPostError('Invalid JSON format. Please check your syntax.');
        return;
      }
    } else {
      payload = postForm;
    }

    setIsPosting(true);
    try {
      // UPDATED TO LIVE RENDER URL
      const res = await fetch('https://competency-matrix-calculator-yaqc.onrender.com/api/update-competency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    setGetError('');
    setGetResponse(null);

    let payload;
    if (getMode === 'json') {
      try {
        payload = JSON.parse(getJson);
      } catch (err) {
        setGetError('Invalid JSON format. Please check your syntax.');
        return;
      }
    } else {
      payload = getForm;
    }

    if (!payload.student_id) {
      setGetError('A "student_id" is required.');
      return;
    }

    setIsFetching(true);
    try {
      // UPDATED TO LIVE RENDER URL
      const url = new URL(`https://competency-matrix-calculator-yaqc.onrender.com/api/competency/${payload.student_id}`);
      if (payload.exam_type) url.searchParams.append('exam_type', payload.exam_type);
      if (payload.batch_id) url.searchParams.append('batch_id', payload.batch_id);

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
    container: { fontFamily: 'system-ui, sans-serif', maxWidth: '1100px', margin: '0 auto', padding: '20px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' },
    card: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', background: '#fefefe' },
    tabContainer: { display: 'flex', marginBottom: '15px', borderBottom: '2px solid #eee' },
    tab: (isActive: boolean) => ({
      padding: '8px 16px', cursor: 'pointer', border: 'none', background: 'transparent',
      borderBottom: isActive ? '2px solid #007bff' : '2px solid transparent',
      fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#007bff' : '#555',
      marginBottom: '-2px'
    }),
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column' as const, marginBottom: '10px' },
    label: { marginBottom: '4px', fontWeight: 'bold', fontSize: '13px', color: '#333' },
    input: { padding: '8px', borderRadius: '4px', border: '1px solid #aaa', fontSize: '14px' },
    textarea: { padding: '10px', borderRadius: '4px', border: '1px solid #aaa', fontSize: '13px', fontFamily: 'monospace', minHeight: '220px', resize: 'vertical' as const, width: '100%', boxSizing: 'border-box' as const },
    button: { padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', width: '100%' },
    pre: { background: '#1e1e1e', color: '#d4d4d4', padding: '15px', borderRadius: '4px', overflowX: 'auto' as const, fontSize: '13px', maxHeight: '400px' },
    error: { color: '#dc3545', fontSize: '13px', marginTop: '5px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Competency API Tester</h2>
      
      <div style={styles.grid}>
        
        {/* ======================= POST SECTION ======================= */}
        <div style={styles.card}>
          <h3>1. Update Competency (POST)</h3>
          
          <div style={styles.tabContainer}>
            <button style={styles.tab(postMode === 'json')} onClick={() => setPostMode('json')}>Raw JSON</button>
            <button style={styles.tab(postMode === 'form')} onClick={() => setPostMode('form')}>Form Input</button>
          </div>

          <form onSubmit={submitPost}>
            {postMode === 'json' ? (
              <div>
                <textarea 
                  style={styles.textarea} 
                  placeholder={postPlaceholder}
                  value={postJson} 
                  onChange={(e) => setPostJson(e.target.value)} 
                  required
                />
              </div>
            ) : (
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Student ID</label>
                  <input style={styles.input} name="student_id" placeholder="abc-123" value={postForm.student_id} onChange={handlePostFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Exam Type</label>
                  <input style={styles.input} name="exam_type" placeholder="IELTS" value={postForm.exam_type} onChange={handlePostFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Batch ID</label>
                  <input style={styles.input} name="batch_id" placeholder="batch-2026-kerala" value={postForm.batch_id} onChange={handlePostFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Skill</label>
                  <input style={styles.input} name="skill" placeholder="speaking" value={postForm.skill} onChange={handlePostFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sub Skill</label>
                  <input style={styles.input} name="sub_skill" placeholder="pronunciation" value={postForm.sub_skill} onChange={handlePostFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Score</label>
                  <input style={styles.input} type="number" step="0.5" placeholder="5.0" name="new_score" value={postForm.new_score} onChange={handlePostFormChange} required />
                </div>
                <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Session Type</label>
                  <select style={styles.input} name="session_type" value={postForm.session_type} onChange={handlePostFormChange}>
                    <option value="drill">Drill</option>
                    <option value="internal_assessment">Internal Assessment</option>
                    <option value="mock">Mock Test</option>
                  </select>
                </div>
              </div>
            )}

            {postError && <div style={styles.error}>{postError}</div>}
            
            <button type="submit" style={styles.button} disabled={isPosting}>
              {isPosting ? 'Sending...' : `Send POST Request (${postMode.toUpperCase()})`}
            </button>
          </form>

          {postResponse && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Response</h4>
              <pre style={styles.pre}>{JSON.stringify(postResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* ======================= GET SECTION ======================= */}
        <div style={styles.card}>
          <h3>2. Fetch Matrix (GET)</h3>
          
          <div style={styles.tabContainer}>
            <button style={styles.tab(getMode === 'json')} onClick={() => setGetMode('json')}>Raw JSON</button>
            <button style={styles.tab(getMode === 'form')} onClick={() => setGetMode('form')}>Form Input</button>
          </div>

          <form onSubmit={submitGet}>
            {getMode === 'json' ? (
              <div>
                <textarea 
                  style={{...styles.textarea, minHeight: '185px'}} 
                  placeholder={getPlaceholder}
                  value={getJson} 
                  onChange={(e) => setGetJson(e.target.value)} 
                  required
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Student ID</label>
                  <input style={styles.input} name="student_id" placeholder="abc-123" value={getForm.student_id} onChange={handleGetFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Exam Type</label>
                  <input style={styles.input} name="exam_type" placeholder="IELTS" value={getForm.exam_type} onChange={handleGetFormChange} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Batch ID</label>
                  <input style={styles.input} name="batch_id" placeholder="batch-2026-kerala" value={getForm.batch_id} onChange={handleGetFormChange} required />
                </div>
              </div>
            )}

            {getError && <div style={styles.error}>{getError}</div>}

            <button type="submit" style={styles.button} disabled={isFetching}>
              {isFetching ? 'Fetching...' : `Fetch GET Request (${getMode.toUpperCase()})`}
            </button>
          </form>

          {getResponse && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Response</h4>
              <pre style={styles.pre}>{JSON.stringify(getResponse, null, 2)}</pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}