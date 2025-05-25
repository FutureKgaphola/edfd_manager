
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchapplications=async()=>{
   const resp= await axios.get(`/api/applications/fetch`);
    return resp.data || [];
}
const useApplications= () => {
    const {data,isLoading,error} =useQuery({
        queryFn : ()=>fetchapplications(),
        queryKey: ['applications'],
    });

    return {data,isLoading,error};
};

export default useApplications;