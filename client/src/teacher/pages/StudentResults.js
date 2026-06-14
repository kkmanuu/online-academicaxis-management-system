import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';

const StudentResults = () => {
  const { examId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    if (examId) fetchExamResults(examId);
    else fetchAllResults();
  }, [examId]);

  const fetchExamResults = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teacher/exams/${id}/results`,
        { headers: getAuthHeader() }
      );
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      setError('Failed to load exam results. Please try again.');
      setLoading(false);
    }
  };

  const fetchAllResults = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teacher/results`,
        { headers: getAuthHeader() }
      );
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all results:', error);
      setError('Failed to load results. Please try again.');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredResults = results.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (result.student && result.student.name && result.student.name.toLowerCase().includes(searchLower)) ||
      (result.exam && result.exam.title && result.exam.title.toLowerCase().includes(searchLower)) ||
      (result.exam && result.exam.course && result.exam.course.name && result.exam.course.name.toLowerCase().includes(searchLower))
    );
  });

  const passCount = filteredResults.filter(r => r.status === 'pass').length;

  if (loading)
    return (
      <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div style={{ width: 40, height: 40, border: '3px solid #e0eaf5', borderTopColor: '#0369a1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto .75rem' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#5a7a9e', fontSize: '.875rem', margin: 0 }}>Loading results…</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="page-header-teacher">
        <h1 className="page-title-teacher">{examId ? 'Exam Results' : 'All Student Results'}</h1>
        <p className="page-subtitle-teacher">
          {examId ? 'Results for this specific exam.' : 'Aggregated results across all your exams.'}
        </p>
      </div>

      <div className="content-area-teacher">
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '.875rem', color: '#b91c1c', marginBottom: '1.5rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span style={{ flex: 1 }}>{error}</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }} onClick={() => setError('')}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Stat strip */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Results', value: filteredResults.length, icon: 'bi-clipboard-data-fill', bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'Passed', value: passCount, icon: 'bi-check-circle-fill', bg: '#dcfce7', color: '#15803d' },
            { label: 'Failed', value: filteredResults.length - passCount, icon: 'bi-x-circle-fill', bg: '#fee2e2', color: '#b91c1c' },
            { label: 'Pass Rate', value: filteredResults.length ? `${((passCount / filteredResults.length) * 100).toFixed(0)}%` : '—', icon: 'bi-graph-up-arrow', bg: '#ede9fe', color: '#5b21b6' },
          ].map((s) => (
            <div key={s.label} className="col-6 col-lg-3">
              <div className="teacher-stat-card d-flex align-items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${s.icon}`} style={{ fontSize: '1.15rem', color: s.color }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#5a7a9e' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#0c1a2e', lineHeight: 1.2 }}>{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="teacher-card mb-4" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="admin-search-wrap">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="admin-search-input"
              style={{ borderColor: '#e0eaf5', background: '#f0f6ff' }}
              placeholder="Search by student name, exam title, or course…"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="teacher-card text-center py-5">
            <i className="bi bi-clipboard-x" style={{ fontSize: '2.5rem', color: '#bfdbf7', display: 'block', marginBottom: '1rem' }}></i>
            <p style={{ fontWeight: 600, color: '#5a7a9e', margin: 0 }}>No results found</p>
            <p style={{ fontSize: '.8rem', color: '#7dd3fc', margin: '.25rem 0 0' }}>Try adjusting your search.</p>
          </div>
        ) : (
          <div className="teacher-card" style={{ overflow: 'hidden' }}>
            <div className="teacher-card-header">
              <i className="bi bi-bar-chart-line-fill" style={{ color: '#0369a1', fontSize: '1.1rem' }}></i>
              <span style={{ fontWeight: 700, fontSize: '.95rem', color: '#0c1a2e' }}>
                {examId ? 'Exam Results' : 'All Student Results'}
              </span>
              <span style={{ marginLeft: 'auto', background: '#dbeafe', color: '#1e40af', fontSize: '.7rem', fontWeight: 700, padding: '.3em .85em', borderRadius: '50rem' }}>
                {filteredResults.length} records
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Student</th>
                    <th>Exam</th>
                    <th>Course</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th style={{ paddingRight: '1.5rem' }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result._id}>
                      <td style={{ paddingLeft: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', flexShrink: 0 }}>
                            {result.student?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600, color: '#0c1a2e' }}>{result.student ? result.student.name : 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#5a7a9e' }}>{result.exam ? result.exam.title : 'Unknown'}</td>
                      <td style={{ color: '#5a7a9e' }}>{result.exam && result.exam.course ? result.exam.course.name : 'Unknown'}</td>
                      <td style={{ fontWeight: 600, color: '#0c1a2e' }}>{result.percentage.toFixed(2)}%</td>
                      <td>
                        <span style={{ fontSize: '.7rem', fontWeight: 600, padding: '.3em .75em', borderRadius: '50rem', background: result.status === 'pass' ? '#dcfce7' : '#fee2e2', color: result.status === 'pass' ? '#15803d' : '#b91c1c' }}>
                          {result.status}
                        </span>
                      </td>
                      <td style={{ color: '#5a7a9e', fontSize: '.8rem', paddingRight: '1.5rem' }}>
                        {new Date(result.submittedAt).toLocaleDateString()}{' '}
                        {new Date(result.submittedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentResults;