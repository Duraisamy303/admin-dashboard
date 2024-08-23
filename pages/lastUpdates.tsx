import IconTrashLines from '@/components/Icon/IconTrashLines';
import { LAST_UPDATE_DETAILS, LOW_STOCK_LIST } from '@/query/product';
import { useMutation, useQuery } from '@apollo/client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CommonLoader from './elements/commonLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const LastUpdates = () => {
    const router = useRouter();

    const [lastUpdateData, { loading: getLoading }] = useMutation(LAST_UPDATE_DETAILS);

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
        lastUpdate();
    }, []);

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
                    let data = {
                        'product Name': item['product Name']?.toLowerCase().includes(search.toLowerCase()),
                        id: item.id,
                    };
                    return data;
                });
            });
        }
    }, [search, page, pageSize, lowStockData]);

    const lastUpdate = async () => {
        try {
            const res = await lastUpdateData();

            const update = res?.data?.stockUpdate;
            const table = update?.dates?.map((date, index) => ({
                date,
                'product Name': update.productNameList[index],
                Quantity: update.quantityList[index],
                id: update?.productIdList[index],
            }));

            setLowStockData(table);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <div className="">
            <div className="panel mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Last Updates</h5>
                <input type="text" className="form-input  mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="datatables">
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={initialData}
                        columns={[
                            {
                                accessor: 'product Name',
                                sortable: true,
                                render: (row) => (
                                    <div className="cursor-pointer" onClick={() => router.push(`/apps/product/edit?id=${row.id}`)}>
                                        {row['product Name']}
                                    </div>
                                ),
                            },
                            { accessor: 'date', sortable: true },
                            { accessor: 'Quantity', sortable: true },
                        ]}
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
};
export default PrivateRouter(LastUpdates);
