
import Image from 'next/image';
import note from '../../../assets/images/note.png';
import { Badge, Button, Card, Spinner } from 'flowbite-react';
import { customsubmitTheme } from '@/app/SiteTheme/Theme';
import { useDispatch } from 'react-redux';
import { DistrictDataSliceAction } from "@/lib/features/DistrictApplications/districtSlice";

const Sekhukhune = ({ data, isLoading }: { data: any, isLoading: boolean }) => {
    const dispatch = useDispatch();
    return (
        <Card className="max-w-sm flex items-center justify-center">
            <Image src={note} className="h-12 w-12 self-center" alt="User Icon" />
            {isLoading ? (<Spinner size="sm" aria-label="Info spinner example" className="me-3" light />) : <Button onClick={() => dispatch(DistrictDataSliceAction.PopulateTable({ isShowTable: true, TableData: data }))} size="xs" theme={customsubmitTheme} color="success">
                Applications
                <Badge className="ms-2 rounded-full px-1.5">{data?.length || 0}</Badge>
            </Button>}
            <p className="font-thin text-xs self-center">Sekhukhune</p>
        </Card>
    );
}

export default Sekhukhune;