import { doc, updateDoc } from "firebase/firestore";
import { toast } from 'react-toastify';
import firestore from "../firebase";

const handleUpdate = async (data) => {
  const ref = doc(firestore, "transfers", data.id);
  
  try {
    await updateDoc(ref, data);
    toast.success("Transfer successfully updated.", { autoClose: 1500 });
  } catch(err) {
    console.log(err);
    toast.error(err.message, { autoClose: 4500 });
  }
}

export default handleUpdate;
