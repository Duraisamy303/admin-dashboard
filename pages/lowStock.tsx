import IconTrashLines from '@/components/Icon/IconTrashLines';
import { LOW_STOCK_LIST } from '@/query/product';
import { useQuery } from '@apollo/client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CommonLoader from './elements/commonLoader';

export default function LowStock() {
    const {
        data: lowStockList,
        loading: getLoading,
        refetch: productSearchRefetch,
    } = useQuery(LOW_STOCK_LIST, {
        variables: {
            channel: 'india-channel',
            first: 500,
            after: null,
            filter: {
                categories: [],
                stockAvailability: 'OUT_OF_STOCK',
            },
        },
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const PAGE_SIZES = [10, 20, 30];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [lowStockData, setLowStockData] = useState([]);
    const [initialData, setInitialData] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (lowStockList?.products?.edges?.length > 0) {
            const newData = lowStockList?.products?.edges?.map((item: any) => {
                return {
                    ...item.node,
                    name: item?.node?.name || '',
                };
            });

            setLowStockData(newData);
        }
    }, [lowStockList]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setInitialData([...lowStockData.slice(from, to)]);
    }, [page, pageSize, lowStockData]);

    useEffect(() => {
        if (search === '') {
            // If search input is cleared, show all data
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            setInitialData([...lowStockData.slice(from, to)]);
        } else {
            // If there is a search term, filter the data
            setInitialData(() => {
                return lowStockData.filter((item: any) => {
                    return item?.name?.toLowerCase().includes(search.toLowerCase());
                });
            });
        }
    }, [search, page, pageSize, lowStockData]);

    return (
        <div className="">
            <div className="panel mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Low Stocks</h5>
                <input type="text" className="form-input  mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="datatables">
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={initialData}
                        columns={[{ accessor: 'name', sortable: true, title: 'Product Name' }]}
                        highlightOnHover
                        totalRecords={lowStockData.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={null}
                        onSortStatusChange={null}
                        selectedRecords={null}
                        onSelectedRecordsChange={(selectedRecords) => {
                            // setSelectedRecords(selectedRecords);
                        }}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                )}
            </div>
        </div>
    );
}
