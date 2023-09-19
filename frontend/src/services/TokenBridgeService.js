import { doc, addDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import firestore from "../firebase";

const TokenBridgeService = {

  fetchRecords: async () => {
    let records = [];

    await getDocs(
      collection(firestore, "transfers")
    ).then((recs) => {
      recs.forEach((record) => {
        records.push({
          id: record.id,
          ...record.data()
        });
      });
    });

    return records;
  },

  transferAmount: async (data) => {
    const ref = collection(firestore, "transfers");

    return await addDoc(ref, data);
  },

  claimAmount: async (data) => {
    const ref = doc(firestore, "transfers", data.id);

    return await updateDoc(ref, data);
  }
};

export default TokenBridgeService;
