import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button, Loader } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import Image1 from '@/public/assets/images/profile-1.jpeg';
import Image2 from '@/public/assets/images/profile-2.jpeg';
import Image3 from '@/public/assets/images/profile-3.jpeg';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import IconEye from '@/components/Icon/IconEye';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { CATEGORY_LIST, CREATE_CATEGORY, DELETE_CATEGORY, PRODUCT_LIST, UPDATE_CATEGORY, PRODUCT_LIST_TAGS, CREATE_TAG, UPDATE_TAG, DELETE_TAG } from '@/query/product';
import ReactQuill from 'react-quill';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { Success } from '@/utils/functions';
import IconLoader from '@/components/Icon/IconLoader';
import { useRouter } from 'next/router';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import CommonLoader from '../elements/commonLoader';

const Tags = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [addTag, { loading: addLoading }] = useMutation(CREATE_TAG);
    const [updateTag, { loading: updateLoading }] = useMutation(UPDATE_TAG);
    const [deleteCategory] = useMutation(DELETE_TAG);
    const [bulkDelete] = useMutation(DELETE_TAG);

    const dispatch = useDispatch();

    const PAGE_SIZE = 10;

    const router = useRouter();

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);
    const [totalCount, setTotalCount] = useState(0);

    const {
        data: customerData,
        loading: getLoading,
        refetch: categoryListRefetch,
    } = useQuery(PRODUCT_LIST_TAGS, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: search !== '' ? search : '',
        },
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const {} = useQuery(PRODUCT_LIST_TAGS, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: '',
        },
        onCompleted: (data) => {
            setTotalCount(data?.tags?.totalCount);
        },
    });

    const { data, refetch: refetch } = useQuery(PRODUCT_LIST_TAGS, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: '',
        },
    });

    const [fetchNextPage] = useLazyQuery(PRODUCT_LIST_TAGS, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(PRODUCT_LIST_TAGS, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const commonPagination = (data) => {
        const customers = data.tags.edges;
        const pageInfo = data.tags?.pageInfo;

        const newData = customers?.map((item: any) => {
            return {
                name: item.node?.name,
                id: item.node?.id,
            };
        });
        setRecordsData(newData);
        setStartCursor(pageInfo?.startCursor || null);
        setEndCursor(pageInfo?.endCursor || null);
        setHasNextPage(pageInfo?.hasNextPage || false);
        setHasPreviousPage(pageInfo?.hasPreviousPage || false);
    };

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
                before: null,
                search: search,
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
                search: search,
            },
        });
    };
    // Statement Earrings necklaces
    const refresh = async () => {
        try {
            const { data } = await refetch({
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: '',
            });
            console.log('data: ', data);
            commonPagination(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };
    const handleSearchChange = async (e) => {
        console.log('e: ', e);
        setSearch(e);
        if (e == '') {
            console.log('if: ');
            refresh();
        } else {
            console.log('else: ');
            const res = await categoryListRefetch({
                variables: {
                    channel: 'india-channel',
                    search: e,
                    last: PAGE_SIZE,
                    before: startCursor,
                },
            });
            commonPagination(res?.data);
        }
    };

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Name'),
    });

    // form submit
    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            const variables = {
                input: {
                    name: record.name,
                },
            };

            const { data } = await (modalTitle ? updateTag({ variables: { ...variables, id: modalContant.id } }) : addTag({ variables }));
            Success('Tag created successfully');
            refresh();
            setModal1(false);
            resetForm();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // category table edit
    const EditCategory = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
    };

    // category table create
    const CreateTags = () => {
        setModal1(true);
        setModalTitle(null);
        setModalContant(null);
    };

    // view categotry
    // const ViewCategory = (record: any) => {
    //     setViewModal(true);
    // };

    // delete Alert Message
    const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                reverseButtons: true,
                padding: '2em',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    onConfirm(); // Call the onConfirm function if the user confirms the deletion
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    onCancel(); // Call the onCancel function if the user cancels the deletion
                }
            });
    };

    const BulkDeleteCategory = async () => {
        showDeleteAlert(
            async () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
                refresh();
                setSelectedRecords([]);
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const DeleteCategory = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteCategory({ variables: { id: record.id } });
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                refresh();
                setSelectedRecords([]);
            },
            () => {
                Swal.fire('Cancelled', 'Your Tag List is safe :)', 'error');
            }
        );
    };

    return (
        <div>
            {/* {getLoading ? (
                <CommonLoader />
            ) : ( */}
                <div className="panel mt-6">
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-light">Tags ({totalCount})</h5>

                        <div className="flex ltr:ml-auto rtl:mr-auto">
                            <input type="text" className="form-input mr-2 w-auto" placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
                            <div className="dropdown  mr-2 ">
                                <Dropdown
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="btn btn-outline-primary dropdown-toggle"
                                    button={
                                        <>
                                            Bulk Actions
                                            <span>
                                                <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                            </span>
                                        </>
                                    }
                                >
                                    <ul className="!min-w-[170px]">
                                        <li>
                                            <button type="button" onClick={() => BulkDeleteCategory()}>
                                                Delete
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                            <button type="button" className="btn btn-primary" onClick={() => CreateTags()}>
                                + Create
                            </button>
                        </div>
                    </div>
                    {getLoading ? (
                        <CommonLoader />
                    ) : (
                        <div className="datatables">
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={recordsData}
                                columns={[
                                    { accessor: 'name', sortable: true },
                                    {
                                        accessor: 'actions',
                                        title: 'Actions',
                                        render: (row: any) => (
                                            <>
                                                <Tippy content="Edit">
                                                    <button type="button" onClick={() => EditCategory(row)}>
                                                        <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                    </button>
                                                </Tippy>
                                                <Tippy content="Delete">
                                                    <button type="button" onClick={() => DeleteCategory(row)}>
                                                        <IconTrashLines />
                                                    </button>
                                                </Tippy>
                                            </>
                                        ),
                                    },
                                ]}
                                highlightOnHover
                                totalRecords={recordsData?.length}
                                recordsPerPage={PAGE_SIZE}
                                minHeight={200}
                                page={null}
                                onPageChange={(p) => {}}
                                withBorder={true}
                                sortStatus={sortStatus}
                                onSortStatusChange={setSortStatus}
                                selectedRecords={selectedRecords}
                                onSelectedRecordsChange={(val) => {
                                    setSelectedRecords(val);
                                }}
                            />
                        </div>
                    )}

                    <div className="mt-5 flex justify-end gap-3">
                        <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                            <IconArrowBackward />
                        </button>
                        <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                            <IconArrowForward />
                        </button>
                    </div>
                </div>
            {/* )} */}

            {/* CREATE AND EDIT Tags FORM */}
            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Tags' : 'Edit Tags'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={modalContant === null ? { name: '' } : { name: modalContant?.name }}
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name</label>
                                                        <Field name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />
                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {addLoading || updateLoading ? <IconLoader /> : 'Submit'}
                                                    </button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PrivateRouter(Tags);
