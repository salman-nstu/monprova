import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";


const useAuth = () => {
    const auth = useContext(AuthContext)
    console.log("myuser",auth)
    return auth
};

export default useAuth;