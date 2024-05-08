import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import CreateNotesImg from "../../assets/images/create-document.svg";
import NoDataImg from "../../assets/images/no-data.svg";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState();

  const [isSearch,setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: noteDetails });
  }

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An error occurred while fetching notes");
    }
  };

  // Delete note
  const deleteNote = async (data) => {
    const noteId = data._id;  

    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        getAllNotes();
      }
    } catch (error) {
      if(error.response && error.response.data && error.response.data.message) {
        console.log(error.respone.data.message);
      }
    }
  };

   //Search for a note
   const onSearchNote = async(query) =>{
      try{
        const response =await axiosInstance.get("/search-notes",{
        params : {query},
      });
        if(ServerResponse.data && ServerResponse.data.notes) {
          setIsSearch(true);
          setAllNotes(response.data.notes);
        }
      }catch(error){
        console.log(error);
      }
   };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;

    try {
      const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
        isPinned : !noteData.isPinned,
      });

      if (response.data && response.data.note) {
        getAllNotes();
        
      }
    } catch (error) {
      console.log(error);
    }
  }

   const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
   };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
          userInfo={userInfo} 
          onSearchNote={onSearchNote}
          handleClearSearch={handleClearSearch}/>

      <div className="container mx-auto">
        {allNotes.length > 0 ?  (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item, index) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => {handleEdit(item)}}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item  )}
             />
            ))} 
         </div>
        ) : (
          <EmptyCard 
          imgSrc={isSearch ? NoDataImg : CreateNotesImg}
           message={isSearch ? "Aramanızla eşleşen bir not buunamadı."
            : "İlk notunuzu oluşturmak için 'Add' butonuna tıklayın!"} />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}f
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
        />
      </Modal>
    </>
  );
};

export default Home;
