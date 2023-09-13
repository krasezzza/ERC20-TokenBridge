import { getDocs, collection } from "firebase/firestore";
import firestore from "../firebase";

const handleFetch = async () => {
  const docRefs = await getDocs(
    collection(firestore, "transfers")
  );

  let records = [];

  docRefs.forEach((transfer) => {
    records.push({
      id: transfer.id,
      ...transfer.data()
    });
  });

  return records;
}

export default handleFetch;
