// src/components/Sections.js
import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function Sections({ currentSection, setCurrentSection }) {
  const [sections,setSections]=useState([]);
  const [newSection,setNewSection]=useState('');

  const loadSections=()=>{
    API.get('/sections').then(res=>{
      setSections(res.data);
      if(!currentSection && res.data.length) setCurrentSection(res.data[0]._id);
    });
  }

  useEffect(()=>{ loadSections(); }, []);

  const createSection=async()=>{
    if(!newSection) return alert('Enter section name');
    try{
      await API.post('/sections',{ name:newSection });
      setNewSection('');
      loadSections();
    }catch(err){ alert(err.response?.data?.error||'Failed'); }
  }

  return (
    <div className="mb-4 flex gap-3 items-center">
      <select value={currentSection} onChange={e=>setCurrentSection(e.target.value)} className="p-2 border rounded">
        {sections.map(s=> <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>
      <input value={newSection} onChange={e=>setNewSection(e.target.value)} placeholder="New section" className="p-2 border rounded"/>
      <button onClick={createSection} className="bg-blue-500 text-white px-3 py-1 rounded">Add Section</button>
    </div>
  )
}
