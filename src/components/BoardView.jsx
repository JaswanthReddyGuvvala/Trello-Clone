import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection, onSnapshot, query, where, doc, getDoc,
  updateDoc, addDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const BoardView = () => {
  const { boardId } = useParams();
  const [boardName, setBoardName] = useState("");
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [cardText, setCardText] = useState("");
  const [currentTagName, setCurrentTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#22c55e");
  const [tempTags, setTempTags] = useState([]); 

  const colors = [
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Orange", hex: "#f97316" },
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Purple", hex: "#a855f7" },
  ];

  useEffect(() => {
    if (!boardId) return;
    getDoc(doc(db, "boards", boardId)).then((docSnap) => {
      if (docSnap.exists()) setBoardName(docSnap.data().name);
    });

    const qList = query(collection(db, "lists"), where("boardId", "==", boardId));
    const unsubList = onSnapshot(qList, (snap) => {
      setLists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qCard = query(collection(db, "cards"), where("boardId", "==", boardId));
    const unsubCard = onSnapshot(qCard, (snap) => {
      const fetchedCards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCards(fetchedCards.sort((a, b) => (a.index || 0) - (b.index || 0)));
    });

    return () => { unsubList(); unsubCard(); };
  }, [boardId]);

  const openModal = (listId, card = null) => {
    setActiveListId(listId);
    if (card) {
      setEditingCardId(card.id);
      setCardText(card.text);
      setTempTags(card.tags || []);
    } else {
      setEditingCardId(null);
      setCardText("");
      setTempTags([]);
    }
    setIsModalOpen(true);
  };

  const addList = async () => {
    const title = prompt("Enter List Title:");
    if (title && title.trim()) {
      await addDoc(collection(db, "lists"), { title: title.trim(), boardId });
    }
  };

  const editListName = async (listId, currentTitle) => {
    const newTitle = prompt("Edit List Title:", currentTitle);
    if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
      await updateDoc(doc(db, "lists", listId), { title: newTitle.trim() });
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceListCards = cards.filter(c => c.listId === source.droppableId).sort((a, b) => a.index - b.index);
    const destListCards = source.droppableId === destination.droppableId 
      ? sourceListCards 
      : cards.filter(c => c.listId === destination.droppableId).sort((a, b) => a.index - b.index);

    const movedCard = cards.find(c => c.id === draggableId);
    const newSourceCards = Array.from(sourceListCards);
    newSourceCards.splice(source.index, 1);

    const newDestCards = source.droppableId === destination.droppableId ? newSourceCards : Array.from(destListCards);
    newDestCards.splice(destination.index, 0, { ...movedCard, listId: destination.droppableId });

    const updatedCards = cards.map(card => {
      const destMatch = newDestCards.find(dc => dc.id === card.id);
      if (destMatch) return { ...card, listId: destination.droppableId, index: newDestCards.indexOf(destMatch) };
      const sourceMatch = newSourceCards.find(sc => sc.id === card.id);
      if (sourceMatch) return { ...card, index: newSourceCards.indexOf(sourceMatch) };
      return card;
    });
    setCards(updatedCards.sort((a, b) => (a.index || 0) - (b.index || 0)));

    const batch = writeBatch(db);
    batch.update(doc(db, "cards", draggableId), { listId: destination.droppableId, index: destination.index });
    newDestCards.forEach((card, idx) => { if (card.id !== draggableId) batch.update(doc(db, "cards", card.id), { index: idx }); });
    if (source.droppableId !== destination.droppableId) {
      newSourceCards.forEach((card, idx) => batch.update(doc(db, "cards", card.id), { index: idx }));
    }
    await batch.commit();
  };

  const addTagToTempList = () => {
    if (!currentTagName.trim()) return;
    setTempTags([...tempTags, { text: currentTagName, color: selectedColor }]);
    setCurrentTagName(""); 
  };

  const removeTagFromTempList = (index) => {
    setTempTags(tempTags.filter((_, i) => i !== index));
  };

  const submitCard = async () => {
    if (!cardText) return;

    if (editingCardId) {
      await updateDoc(doc(db, "cards", editingCardId), {
        text: cardText,
        tags: tempTags
      });
    } else {
      const listCardsCount = cards.filter(c => c.listId === activeListId).length;
      await addDoc(collection(db, "cards"), { 
        text: cardText, 
        listId: activeListId, 
        boardId, 
        tags: tempTags,
        index: listCardsCount 
      });
    }
    
    setIsModalOpen(false);
    setCardText("");
    setTempTags([]);
    setEditingCardId(null);
  };

  return (
    <div className="p-6 bg-slate-500 min-h-screen relative font-sans">
      <div className="flex items-center justify-between mb-8 bg-black/10 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-white bg-white/10 px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition-all">← Home</Link>
          <h1 className="text-3xl font-black text-white tracking-tight">{boardName || "Loading..."}</h1>
        </div>
        <button onClick={addList} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform active:scale-95 transition-all">+ Add List</button>
      </div>

      <div className="flex gap-4 overflow-x-auto items-start pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {lists.map(list => (
            <div key={list.id} className="bg-gray-100 p-3 rounded-xl min-w-[280px] h-fit shadow-xl border-t-4 border-blue-400">
              <div className="flex justify-between items-center mb-4 px-1">
                 <h3 onClick={() => editListName(list.id, list.title)} className="font-bold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">{list.title}</h3>
                 <button onClick={() => deleteDoc(doc(db, "lists", list.id))} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
              </div>

              <Droppable droppableId={list.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[50px]">
                    {cards.filter(c => c.listId === list.id).map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps} 
                            className={`bg-white p-3 rounded-lg shadow-sm mb-3 cursor-pointer group relative transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-blue-400' : 'hover:shadow-md'}`}
                          >
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openModal(list.id, card); }}
                                className="text-gray-400 hover:text-blue-500 text-xs font-bold p-1 bg-gray-50 rounded"
                              >
                                ✎
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, "cards", card.id)); }}
                                className="text-gray-400 hover:text-red-500 text-xs font-bold p-1 bg-gray-50 rounded"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2 pr-10">
                              {card.tags?.map((tag, idx) => (
                                <span key={idx} style={{ backgroundColor: tag.color }} className="text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">{tag.text}</span>
                              ))}
                            </div>
                            <div className="text-gray-800 text-sm font-semibold pr-10 leading-tight">{card.text}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <button onClick={() => openModal(list.id)} className="w-full text-left text-xs font-bold text-gray-500 mt-2 p-2 hover:bg-gray-200 rounded-lg transition-colors">+ Add Card</button>
            </div>
          ))}
        </DragDropContext>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {editingCardId ? "Edit Card" : "Create New Card"}
            </h2>
            
            <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Add Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tempTags.map((tag, i) => (
                  <span key={i} style={{ backgroundColor: tag.color }} className="text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold">
                    {tag.text}
                    <button onClick={() => removeTagFromTempList(i)} className="hover:text-black">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={currentTagName}
                  onChange={(e) => setCurrentTagName(e.target.value)}
                  placeholder="Tag label..."
                  className="flex-1 p-2 text-sm border rounded outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={addTagToTempList} className="bg-blue-600 text-white px-3 rounded text-sm font-bold hover:bg-blue-700">Add</button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                  {colors.map((c) => (
                    <button key={c.hex} onClick={() => setSelectedColor(c.hex)} style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full ${selectedColor === c.hex ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <textarea 
              rows="3"
              value={cardText}
              onChange={(e) => setCardText(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Card description..."
            />

            <div className="flex justify-end gap-3 font-bold">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
              <button onClick={submitCard} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg">
                {editingCardId ? "Update Card" : "Save Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardView;