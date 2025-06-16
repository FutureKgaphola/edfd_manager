
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchOriginators=async(id:string)=>{
   const resp= await axios.get(`/api/originators/retrive?districtd=${id}`);
    return resp.data || [];
}
const useOriginators= (id:string) => {
    const {data,isLoading,error} =useQuery({
        queryFn : ()=>fetchOriginators(id),
        enabled: !!id, // Only run the query if id is provided
        queryKey: ['originators'+id],
    });

    return {data,isLoading,error};
};

export default useOriginators;