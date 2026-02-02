// src/pages/Contacts.js
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Sections from './ContactSections';
import API from '../utils/api';

export default function Contacts() {
  const [contacts,setContacts]=useState([]);
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [currentSection,setCurrentSection]=useState('');
  const fileRef=useRef(null);

  const load=async()=>{
    if(!currentSection) return;
    try{
      const res = await API.get(`/contacts?section=${currentSection}`);
      setContacts(res.data.data||res.data);
    }catch(err){ alert('Failed to load contacts') }
  }

  useEffect(()=>{ if(currentSection) load(); }, [currentSection]);

  const add=async e=>{
    e.preventDefault();
    if(!currentSection) return alert('Select section first');
    try{
      await API.post('/contacts',{ name, phone, section: currentSection });
      setName(''); setPhone('');
      load();
    }catch(err){ alert(err.response?.data?.error||'Add failed') }
  }

  const remove=async id=>{
    if(!confirm('Delete contact?')) return;
    try{ await API.delete(`/contacts/${id}`); load(); } catch(err){ alert('Delete failed') }
  }

  const importFile=async()=>{
    const f=fileRef.current.files[0];
    if(!f) return alert('Choose file');
    if(!currentSection) return alert('Select section first');
    const fd=new FormData(); fd.append('file',f); fd.append('section',currentSection);
    try{
      const res=await API.post('/contacts/import',fd,{ headers:{'Content-Type':'multipart/form-data'} });
      alert(`Imported ${res.data.imported} items`);
      load();
    }catch(err){ alert(err.response?.data?.error||'Import failed') }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Navbar />
        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contacts</h2>
          <Sections currentSection={currentSection} setCurrentSection={setCurrentSection} />

          <form onSubmit={add} className="flex gap-2 mb-4">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="p-2 border rounded flex-1"/>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (+...)" className="p-2 border rounded w-56"/>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
          </form>

          <div className="mb-4 flex items-center gap-3">
            <input ref={fileRef} type="file"/>
            <button onClick={importFile} className="bg-green-500 text-white px-3 py-1 rounded">Import CSV/XLSX</button>
            <button onClick={load} className="bg-gray-200 px-3 py-1 rounded">Refresh</button>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c=>(
                  <tr key={c._id} className="border-t">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3 text-center">
                      <button onClick={()=>remove(c._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
                {contacts.length===0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">No contacts</td></tr>}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
