import { protectedProcedure } from "../../../create-context";
import { exercisesCollection } from "@/backend/firestore";
import { getDocs } from "firebase/firestore";

export default protectedProcedure.query(async () => {
  const snapshot = await getDocs(exercisesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
