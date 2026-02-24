import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, addDoc, onSnapshot, query, where, 
  serverTimestamp, doc, deleteDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "boards"), where("owner", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBoards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const createBoard = async () => {
    const name = prompt("Board Name:");
    if (name && user) {
      try {
        await addDoc(collection(db, "boards"), { 
          name: name, 
          owner: user.uid, 
          createdAt: serverTimestamp() 
        });
      } catch (e) {
        console.error("Error creating board: ", e);
      }
    }
  };

  const deleteBoard = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation(); 
    try {
      await deleteDoc(doc(db, "boards", boardId));
    } catch (e) {
      console.error("Error deleting board: ", e);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Your Boards</h1>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-200">
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-8 h-8 rounded-full border border-blue-100"
              />
              <span className="text-sm font-bold text-gray-700 hidden sm:inline">
                {user.displayName}
              </span>
            </div>
          )}
          <button 
            onClick={logout} 
            className="text-red-500 font-bold hover:bg-red-50 px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={createBoard} 
          className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-gray-500 font-bold transition-all shadow-sm"
        >
          + Create Board
        </div>

        {boards.map(board => (
          <div key={board.id} className="relative group">
            <Link 
              to={`/board/${board.id}`} 
              className="h-32 bg-blue-600 rounded-xl p-5 text-white font-bold text-lg shadow-md hover:bg-blue-700 transition-all flex items-end w-full"
            >
              {board.name}
            </Link>
            
            {/* Direct delete button (No dialog) */}
            <button 
              onClick={(e) => deleteBoard(e, board.id)}
              className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all text-xs font-bold leading-none z-10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;