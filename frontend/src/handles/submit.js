import { addDoc, collection } from "firebase/firestore";
import { toast } from 'react-toastify';
import firestore from "../firebase";

const handleSubmit = async (data) => {
  const ref = collection(firestore, "transfers");
  
  try {
    await addDoc(ref, data);
  } catch(err) {
    console.log(err);
    toast.error(err.message, { autoClose: 4500 });
  }
}

export default handleSubmit;
