import { useState, useMemo } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useDispatch } from "react-redux";
import { OriginatorSliceAction } from "@/lib/features/assignOriginator/originator";
import { customInputBoxTheme, customsubmitTheme } from "@/app/SiteTheme/Theme";

export function ApplicationsTable({ data }: { data: any }) {
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter the data based on search input
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data?.filter((item: any) => {
      const regNo = item?.regNo?.toLowerCase() ?? "";
      const appRef = item?.applicationRef?.toLowerCase() ?? "";
      const query = searchQuery.toLowerCase();
      return regNo.includes(query) || appRef.includes(query);
    });
  }, [searchQuery, data]);

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData?.slice(start, start + itemsPerPage);
  }, [currentPage, filteredData]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="overflow-x-auto p-1">
      {/* Search Bar */}
      <div className="mb-4 max-w-md">
        <TextInput
        theme={customInputBoxTheme}
          type="text"
          placeholder="Search by Registration No or Reference No"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      {/* Table */}
      <Table striped>
        <TableHead>
          <TableHeadCell>Registration No</TableHeadCell>
          <TableHeadCell>Reference No</TableHeadCell>
          <TableHeadCell>Amount</TableHeadCell>
          <TableHeadCell>Loan Type</TableHeadCell>
          <TableHeadCell>Date Received</TableHeadCell>
          <TableHeadCell>Asigned To</TableHeadCell>
          <TableHeadCell>
            <span className="sr-only">Edit</span>
          </TableHeadCell>
        </TableHead>
        <TableBody className="divide-y">
          {paginatedData?.map((item: any) => (
            <TableRow key={item?.applicationRef} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {item?.regNo}
              </TableCell>
              <TableCell>{item?.applicationRef}</TableCell>
              <TableCell>R{Number(item?.amount).toFixed(2)}</TableCell>
              <TableCell>{item?.loanDocs}</TableCell>
              <TableCell>{item?.create_date}</TableCell>
              <TableCell>{item?.empno}</TableCell>
              <TableCell>
                {item?.empno && item?.empno=="00000000" ? (<Button
                  onClick={() =>
                    dispatch(
                      OriginatorSliceAction.PoupUpModal_Originators({
                        isShowList: true,
                        slectedApplication_Row: item,
                      })
                    )
                  }
                  theme={customsubmitTheme}
                  color="success"
                  size="xs"
                >
                  Assign to
                </Button>):null}
                
              </TableCell>
            </TableRow>
          ))}

          {/* Empty state */}
          {paginatedData?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {filteredData?.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <Button size="xs" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button size="xs" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
