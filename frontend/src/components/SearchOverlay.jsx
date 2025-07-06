// import { useEffect, useState } from "react";
// import { Search, ArrowLeft } from "lucide-react";
// import { useContactStore } from "../store/useContactStore";
// import { useChatStore } from "../store/useChatStore";

// const SearchOverlay = ({ onClose }) => { 
//   const [query, setQuery] = useState("");
//   const [showResults, setShowResults] = useState(false);
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const { searchUsers } = useContactStore();
//   const { selectedUser, setSelectedUser} = useChatStore();

//   useEffect(() => {
//     const delay = setTimeout(async () => {
//       if (query.length >= 3) {
//         setLoading(true);
//         const res = await searchUsers(query);
//         setSearchResults(res);
//         setLoading(false);
//         setShowResults(true);
//       } else {
//         setShowResults(false);
//       }
//     }, 500);

//     return () => clearTimeout(delay);
//   }, [query]);

//   return (
//     <div className="absolute inset-0 z-50 bg-[#1e1e1e]/95 flex flex-col p-4">
//       <div className="flex items-center gap-3 mb-4">
//         <button onClick={onClose}>
//           <ArrowLeft className="text-gray-400" />
//         </button>
//         <div className="relative w-full">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             autoFocus
//             type="text"
//             placeholder="Search..."
//             className="w-full p-2 pl-9 rounded-full outline-none text-sm bg-[#2c2c2c] text-white"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//         </div>
//       </div>


//       <div className="flex-1 overflow-y-auto space-y-3">
//         {loading && <p className="text-center text-gray-400">Searching...</p>}
//         {!loading && showResults && searchResults.length === 0 && (
//           <p className="text-center text-gray-500">No results found</p>
//         )}
//         {searchResults.map((user) => (
//           <div
//             key={user._id}
//             className="p-3 rounded bg-base-200 hover:bg-base-300 cursor-pointer"
//             onClick={() => {
//                 setSelectedUser(user);
//               onClose();
//             }}
//           >
//             {user.userName}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SearchOverlay;

import { useEffect, useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useContactStore } from "../store/useContactStore";
import { useChatStore } from "../store/useChatStore";

const SearchOverlay = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { searchUsers } = useContactStore();
  const { setSelectedUser } = useChatStore();

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        const res = await searchUsers(query);
        setSearchResults(res);
        setLoading(false);
        setShowResults(true);
      } else {
        setShowResults(false);
        setSearchResults([]); // 🟢 Clear results when query is too short
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query, searchUsers]);


  return (
    <div className="absolute inset-0 z-50 bg-[#1e1e1e]/95 flex flex-col p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onClose}>
          <ArrowLeft className="text-gray-400" />
        </button>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-9 rounded-lg bg-[#2c2c2c] text-white text-sm outline-none focus:ring-2 focus:ring-gray-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && <p className="text-center text-gray-400">Searching...</p>}
        {!loading && showResults && searchResults.length === 0 && (
          <p className="text-center text-gray-500">No results found</p>
        )}
        {searchResults.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#333333] cursor-pointer transition"
            onClick={() => {
              setSelectedUser(user);
              onClose();
            }}
          >
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white">{user.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchOverlay;
