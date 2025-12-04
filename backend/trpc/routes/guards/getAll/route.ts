import { protectedProcedure } from "../../../create-context";
import { guardsCollection } from "@/backend/firestore";
import { getDocs } from "firebase/firestore";

export default protectedProcedure.query(async () => {
  const snapshot = await getDocs(guardsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
