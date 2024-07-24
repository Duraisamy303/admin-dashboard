import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button } from '@mantine/core';
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
import { date } from 'yup/lib/locale';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import Select from 'react-select';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(import('react-quill'), { ssr: false });

import { Tab } from '@headlessui/react';
import AnimateHeight from 'react-animate-height';
const ProductEdit = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [modal1, setModal1] = useState(false);

    const [value, setValue] = useState('demo content'); // quill text editor
    const [isMounted, setIsMounted] = useState(false); //tabs
    useEffect(() => {
        setIsMounted(true);
    });
    const [salePrice, setSalePrice] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [publicVisible, setPublicVisible] = useState(false);
    const [publishedDate, setPublishedDate] = useState(false);
    const [catalogVisible, setCatalogVisible] = useState(false);
    const [addCategory, setAddCategory] = useState(false);

    const [quantityTrack, setQuantityTrack] = useState(true);

    const [active, setActive] = useState<string>('1');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    // Product table create
    const CreateProduct = () => {
        router.push('/apps/product/add');
    };


    const scheduleOpen = () => {
        setSalePrice(!salePrice);
    };

    // tax onchange
    const taxStatus = (value: any) => {
    };

    const taxClass = (value: any) => {
    };

    // track stock
    const trackStock = (value: any) => {
        setQuantityTrack(!quantityTrack);
    };

    const options = [
        { value: 'orange', label: 'Orange' },
        { value: 'white', label: 'White' },
        { value: 'purple', label: 'Purple' },
    ];

    const statusEditClick = () => {
        setStatusVisible(!statusVisible);
    };

    const PublicEditClick = () => {
        setPublicVisible(!publicVisible);
    };

    const PublishedDateClick = () => {
        setPublishedDate(!publishedDate);
    };

    const CatalogEditClick = () => {
        setCatalogVisible(!catalogVisible);
    };

    const addCategoryClick = () => {
        setAddCategory(!addCategory);
    };

    const setproductVideoPopup = () => {
        setModal1(true);
    };

    return (
        <div>
            <div className="  mt-6">
                <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Edit Product</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <button type="button" className="btn btn-primary" onClick={() => CreateProduct()}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className=" col-span-9">
                        <div className="panel mb-5">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Product Name
                            </label>
                            <input type="text" placeholder="Enter Your Name" name="name" className="form-input" required />
                        </div>
                        <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product description
                            </label>
                            <ReactQuill id="editor" theme="snow" value={value} onChange={setValue} />
                        </div>
                        <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product Short description
                            </label>
                            <textarea id="ctnTextarea" rows={3} className="form-textarea" placeholder="Enter Short Description" required></textarea>
                        </div>
                        <div className="panel mb-5 ">
                            <div className="mb-5 flex flex-col border-b border-gray-200 pb-5 pl-10 sm:flex-row">
                                <label htmlFor="name" className="mt-2 block  pr-5 text-sm font-semibold text-gray-700">
                                    Product Data
                                </label>
                                <select className="form-select" style={{ width: '200px' }}>
                                    <option value="1">Simple Product</option>
                                    <option value="2">Variable Product</option>
                                </select>
                            </div>
                            <div className="flex flex-col  sm:flex-row">
                                {isMounted && (
                                    <Tab.Group>
                                        <div className="mx-10 mb-5 sm:mb-0">
                                            <Tab.List className="m-auto w-24 text-center font-semibold">
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? 'text-secondary !outline-none before:!h-[80%]' : ''}
                                                    relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            General
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? 'text-secondary !outline-none before:!h-[80%]' : ''}
                                                    relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            Inventory
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? 'text-secondary !outline-none before:!h-[80%]' : ''}
                                                    relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            Linked Products
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? 'text-secondary !outline-none before:!h-[80%]' : ''}
                                                    relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            Attributes
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? 'text-secondary !outline-none before:!h-[80%]' : ''}
                                                    relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            Advanced
                                                        </button>
                                                    )}
                                                </Tab>
                                            </Tab.List>
                                        </div>
                                        <Tab.Panels>
                                            <Tab.Panel>
                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4">
                                                        <label htmlFor="regularPrice" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Regular Price
                                                        </label>
                                                    </div>
                                                    <div className="mb-5">
                                                        <input type="number" style={{ width: '350px' }} placeholder="Enter Regular Price" name="regularPrice" className="form-input " required />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className=" flex items-center">
                                                        <div className="mb-5 mr-4">
                                                            <label htmlFor="salePrice" className="block pr-10 text-sm font-medium text-gray-700">
                                                                Sale Price
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <input type="number" style={{ width: '350px' }} placeholder="Enter Sale Price" name="salePrice" className="form-input" required />
                                                        </div>
                                                        <div className="mb-5 pl-3">
                                                            <span className="cursor-pointer text-gray-500 underline" onClick={scheduleOpen}>
                                                                {!salePrice ? 'Schedule' : 'Cancel'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {salePrice && (
                                                            <>
                                                                <div className="flex items-center">
                                                                    <div className="mb-5 mr-4">
                                                                        <label htmlFor="regularPrice" className="block pr-2 text-sm font-medium text-gray-700">
                                                                            Sale Price Date
                                                                        </label>
                                                                    </div>
                                                                    <div className="mb-5">
                                                                        <input type="date" style={{ width: '350px' }} placeholder="From.." name="regularPrice" className="form-input" required />
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-end">
                                                                    <div className="mb-5 pl-28">
                                                                        <input type="date" style={{ width: '350px' }} placeholder="From.." name="regularPrice" className="form-input" required />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center">
                                                        <div className="mb-5 mr-4">
                                                            <label htmlFor="tax-status" className="block pr-8 text-sm font-medium text-gray-700">
                                                                Tax Status
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <select className="form-select w-52 flex-1" style={{ width: '350px' }} onChange={(e) => taxStatus(e.target.value)}>
                                                                <option value="taxable">Taxable</option>
                                                                <option value="shipping-only">Shipping Only</option>
                                                                <option value="none">None</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="mb-5 mr-4">
                                                            <label htmlFor="tax-status" className="block pr-10 text-sm font-medium text-gray-700">
                                                                Tax Class
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <select className="form-select w-52 flex-1" style={{ width: '350px' }} onChange={(e) => taxClass(e.target.value)}>
                                                                <option value="standard">Standard</option>
                                                                <option value="reduced-rate">Reduced rate</option>
                                                                <option value="zero-rate">Zero rate</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                <div>
                                                    <div className="active flex items-center">
                                                        <div className="mb-5 mr-4 pr-24">
                                                            <label htmlFor="regularPrice" className="block  text-sm font-medium text-gray-700">
                                                                SKU
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <input type="text" style={{ width: '350px' }} placeholder="Enter SKU" name="sku" className="form-input" required />
                                                        </div>
                                                    </div>

                                                    <div className="active flex items-center">
                                                        <div className="mb-5 mr-4 pr-4">
                                                            <label htmlFor="regularPrice" className="block  text-sm font-medium text-gray-700">
                                                                Stock Management
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <input type="checkbox" onChange={(e) => trackStock(e.target.value)} className="form-checkbox" defaultChecked />
                                                            <span>Track stock quantity for this product</span>{' '}
                                                        </div>
                                                    </div>
                                                    {quantityTrack == true ? (
                                                        <div>
                                                            <div className=" flex items-center">
                                                                <div className="mb-5 mr-4 pr-20">
                                                                    <label htmlFor="quantity" className="block  text-sm font-medium text-gray-700">
                                                                        Quantity
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5">
                                                                    <input
                                                                        type="number"
                                                                        style={{ width: '350px' }}
                                                                        placeholder="Enter Quantity"
                                                                        name="quantity"
                                                                        className="form-input"
                                                                        defaultChecked
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className=" flex items-center">
                                                                <div className="mb-20 mr-4 pr-5">
                                                                    <label htmlFor="allow-orders" className="block  text-sm font-medium text-gray-700">
                                                                        Allow backorders?
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5">
                                                                    <div className="pb-5">
                                                                        <input type="radio" name="default_radio" className="form-radio" defaultChecked />
                                                                        <span>Do Not Allow</span>
                                                                    </div>
                                                                    <div className="pb-5">
                                                                        <input type="radio" name="default_radio" className="form-radio" />
                                                                        <span>Allow, but notify customer</span>
                                                                    </div>
                                                                    <div>
                                                                        <input type="radio" name="default_radio" className="form-radio" />
                                                                        <span>Allow</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className=" flex items-center">
                                                                <div className="mb-5 mr-4 pr-3">
                                                                    <label htmlFor="low-stock" className="block  text-sm font-medium text-gray-700">
                                                                        Low stock threshold
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Enter low stock"
                                                                        style={{ width: '350px' }}
                                                                        name="low-stock"
                                                                        className="form-input"
                                                                        defaultChecked
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className=" flex items-center">
                                                                <div className="mb-20 mr-4 pr-16">
                                                                    <label htmlFor="stock-status" className="block  text-sm font-medium text-gray-700">
                                                                        Stock Status
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5 ">
                                                                    <div className="pb-5">
                                                                        <input type="radio" name="default_radio" className="form-radio" defaultChecked />
                                                                        <span>In stock</span>
                                                                    </div>
                                                                    <div className="pb-5">
                                                                        <input type="radio" name="default_radio" className="form-radio" />
                                                                        <span>Out of stock</span>
                                                                    </div>
                                                                    <div>
                                                                        <input type="radio" name="default_radio" className="form-radio" />
                                                                        <span>On backorder</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="active flex items-center">
                                                        <div className="mb-5 mr-4 pr-10">
                                                            <label htmlFor="sold-individually" className="block  text-sm font-medium text-gray-700">
                                                                Sold individually
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <input type="checkbox" onChange={(e) => trackStock(e.target.value)} className="form-checkbox" defaultChecked />
                                                            <span>Limit purchases to 1 item per order</span>{' '}
                                                        </div>
                                                    </div>

                                                    <div className="active flex items-center">
                                                        <div className="mb-5 mr-4 pr-2">
                                                            <label htmlFor="initial-in-stock" className="block  text-sm font-medium text-gray-700">
                                                                Initial number in stock
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <input type="text" style={{ width: '350px' }} placeholder="Enter Initial stock" name="stock" className="form-input" required />
                                                        </div>
                                                    </div>

                                                    <div className="active flex items-center">
                                                        <div className="mb-5 mr-4 pr-3">
                                                            <label htmlFor="unit-mesurement" className="block  text-sm font-medium text-gray-700">
                                                                Unit of measurement
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <input type="text" style={{ width: '350px' }} placeholder="Enter mesurement" name="mesurement" className="form-input" required />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4 pr-6">
                                                        <label htmlFor="upsells" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Upsells
                                                        </label>
                                                    </div>
                                                    <div className="mb-5" style={{ width: '350px' }}>
                                                        <Select placeholder="Select an option" options={options} isMulti isSearchable={false} />
                                                    </div>
                                                </div>

                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4">
                                                        <label htmlFor="cross-sells" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Cross-sells
                                                        </label>
                                                    </div>
                                                    <div className="mb-5" style={{ width: '350px' }}>
                                                        <Select placeholder="Select an option" options={options} isMulti isSearchable={false} />
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                <div className="active flex items-center">
                                                    <div className="mb-5 pr-3">
                                                        <select className="form-select w-52 flex-1 " style={{ width: '350px' }}>
                                                            <option value="design">Design</option>
                                                            <option value="finish">Finish</option>
                                                            <option value="lock-type">Lock Type</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <button type="button" className="btn btn-outline-primary">
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mb-5">
                                                    <div className="space-y-2 font-semibold">
                                                        <div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
                                                            <button
                                                                type="button"
                                                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${active === '1' ? '!text-primary' : ''}`}
                                                                onClick={() => togglePara('1')}
                                                            >
                                                                Designs
                                                                <div className={`ltr:ml-auto rtl:mr-auto ${active === '1' ? 'rotate-180' : ''}`}>
                                                                    <IconCaretDown />
                                                                </div>
                                                            </button>
                                                            <div>
                                                                <AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>
                                                                    <div className="grid grid-cols-12 gap-4 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                                        <div className="col-span-4">
                                                                            <p>
                                                                                Name:
                                                                                <br /> <span className="font-semibold">Design</span>
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-span-8">
                                                                            <div className="active ">
                                                                                <div className=" mr-4 ">
                                                                                    <label htmlFor="value" className="block pr-5 text-sm font-medium text-gray-700">
                                                                                        Value(s)
                                                                                    </label>
                                                                                </div>
                                                                                <div className="mb-5" style={{ width: '350px' }}>
                                                                                    <Select placeholder="Select an option" options={options} isMulti isSearchable={false} />
                                                                                    <div className="flex justify-between">
                                                                                        <div className="flex">
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mr-2 mt-1">
                                                                                                Select All
                                                                                            </button>
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1">
                                                                                                Select None
                                                                                            </button>
                                                                                        </div>
                                                                                        <div>
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1">
                                                                                                Create Value
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </AnimateHeight>
                                                            </div>
                                                        </div>
                                                        <div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
                                                            <button
                                                                type="button"
                                                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${active === '2' ? '!text-primary' : ''}`}
                                                                onClick={() => togglePara('2')}
                                                            >
                                                                Finish
                                                                <div className={`ltr:ml-auto rtl:mr-auto ${active === '2' ? 'rotate-180' : ''}`}>
                                                                    <IconCaretDown />
                                                                </div>
                                                            </button>
                                                            <div>
                                                                <AnimateHeight duration={300} height={active === '2' ? 'auto' : 0}>
                                                                    <div className="grid w-full grid-cols-12 gap-4 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                                        <div className="col-span-4">
                                                                            <p>
                                                                                Name:
                                                                                <br /> <span className="font-semibold">Finish</span>
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-span-8">
                                                                            <div className="active ">
                                                                                <div className=" mr-4 ">
                                                                                    <label htmlFor="value" className="block pr-5 text-sm font-medium text-gray-700">
                                                                                        Value(s)
                                                                                    </label>
                                                                                </div>
                                                                                <div className="mb-5" style={{ width: '350px' }}>
                                                                                    <Select placeholder="Select an option" options={options} isMulti isSearchable={false} />
                                                                                    <div className="flex justify-between">
                                                                                        <div className="flex">
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mr-2 mt-1">
                                                                                                Select All
                                                                                            </button>
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1">
                                                                                                Select None
                                                                                            </button>
                                                                                        </div>
                                                                                        <div>
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1">
                                                                                                Create Value
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </AnimateHeight>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button type="button" className="btn btn-primary">
                                                        Save Attributes
                                                    </button>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                <div className="active flex items-center">
                                                    <div className="mb-20 mr-4">
                                                        <label htmlFor="regularPrice" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Purchase note
                                                        </label>
                                                    </div>
                                                    <div className="mb-5">
                                                        <textarea rows={3} style={{ width: '350px' }} placeholder="Enter Regular Price" name="regularPrice" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4 pr-3">
                                                        <label htmlFor="regularPrice" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Menu Order
                                                        </label>
                                                    </div>
                                                    <div className="mb-5">
                                                        <input type="number" style={{ width: '350px' }} placeholder="Enter Regular Price" name="regularPrice" className="form-input" required />
                                                    </div>
                                                </div>

                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4 pr-3">
                                                        <label htmlFor="review" className="block  text-sm font-medium text-gray-700">
                                                            Enable reviews
                                                        </label>
                                                    </div>
                                                    <div className="mb-5">
                                                        <input type="checkbox" className="form-checkbox" defaultChecked />
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                )}
                            </div>
                        </div>

                        <div className="panel mb-5">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <h5 className="un mb-5 block text-lg font-medium text-gray-700 underline">Permanent "New" label</h5>
                                    <label className="relative h-6 w-12">
                                        <input type="checkbox" className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0" id="custom_switch_checkbox1" />
                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                    </label>
                                    <p className="mt-2 text-sm text-gray-500">Enable this option to make your product have "New" status forever.</p>
                                </div>
                                <div className="col-span-6">
                                    <h5 className="un mb-5 block text-lg font-medium text-gray-700 underline">Mark product as "New" till date</h5>
                                    <div>
                                        <input type="date" style={{ width: '350px' }} placeholder="From.." name="new-label" className="form-input" required />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Specify the end date when the "New" status will be retired. NOTE: "Permanent "New" label" option should be disabled if you use the exact date.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="panel">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Publish</h5>
                            </div>

                            <p className="mb-5">
                                Status: <span className="font-bold">Published</span>{' '}
                                <span className="ml-2 cursor-pointer text-primary underline" onClick={() => statusEditClick()}>
                                    {statusVisible ? 'Cancel' : 'Edit'}
                                </span>
                            </p>

                            {statusVisible ? (
                                <>
                                    <div className="active flex items-center">
                                        <div className="mb-5 pr-3">
                                            <select className="form-select w-52 flex-1 ">
                                                <option value="published">Published</option>
                                                <option value="pending-reviews">Pending Reviews</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                        </div>
                                        <div className="mb-5">
                                            <button type="button" className="btn btn-outline-primary">
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            <p className="mb-5">
                                Visibility: <span className="font-bold">Public</span>{' '}
                                <span className="ml-2 cursor-pointer text-primary underline" onClick={() => PublicEditClick()}>
                                    {publicVisible ? 'Cancel' : 'Edit'}
                                </span>
                            </p>

                            {publicVisible ? (
                                <>
                                    <div className="active ">
                                        <div className="mb-5">
                                            <div className="pb-5">
                                                <input type="radio" name="default_radio" className="form-radio" defaultChecked />
                                                <span>Public</span>
                                            </div>
                                            <div className="pb-5">
                                                <input type="radio" name="default_radio" className="form-radio" />
                                                <span>Password protected</span>
                                            </div>
                                            <div>
                                                <input type="radio" name="default_radio" className="form-radio" />
                                                <span>Private</span>
                                            </div>
                                        </div>
                                        <div className="mb-5 flex justify-start">
                                            <button type="button" className="btn btn-outline-primary mr-2" onClick={() => setPublicVisible(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary">
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            <p className="mb-5">
                                Published on: <span className="font-bold">May 19, 2023 at 17:53</span>{' '}
                                <span className="ml-2 cursor-pointer text-primary underline" onClick={() => PublishedDateClick()}>
                                    {publishedDate ? 'Cancel' : 'Edit'}
                                </span>
                            </p>

                            {publishedDate ? (
                                <>
                                    <div className="active flex items-center">
                                        <div className="mb-5 pr-3">
                                            <input type="datetime-local" placeholder="From.." name="new-label" className="form-input" required />
                                        </div>
                                        <div className="mb-5">
                                            <button type="button" className="btn btn-outline-primary">
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                            <p className="mb-5">
                                Catalog visibility: <span className="font-bold">Shop and search results</span>{' '}
                                <span className="ml-2 cursor-pointer text-primary underline" onClick={() => CatalogEditClick()}>
                                    {catalogVisible ? 'Cancel' : 'Edit'}
                                </span>
                            </p>

                            {catalogVisible ? (
                                <>
                                    <div className="active">
                                        <p className="mb-2 text-sm text-gray-500">This setting determines which shop pages products will be listed on.</p>
                                        <div className="mb-5">
                                            <div className="pb-3">
                                                <input type="radio" name="default_radio" className="form-radio" defaultChecked />
                                                <span>Shop and search results</span>
                                            </div>
                                            <div className="pb-3">
                                                <input type="radio" name="default_radio" className="form-radio" />
                                                <span>Shop only</span>
                                            </div>
                                            <div className="pb-3">
                                                <input type="radio" name="default_radio" className="form-radio" />
                                                <span>Search results only</span>
                                            </div>

                                            <div className="pb-3">
                                                <input type="radio" name="default_radio" className="form-radio" />
                                                <span>Hidden</span>
                                            </div>
                                        </div>
                                        <div className="pb-3">
                                            <input type="checkbox" className="form-checkbox" />
                                            <span>This is a featured product</span>
                                        </div>
                                        <div className="mb-5 flex justify-start">
                                            <button type="button" className="btn btn-outline-primary mr-2" onClick={() => setCatalogVisible(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary">
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            <button type="submit" className="btn btn-primary w-full">
                                Update
                            </button>
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Image</h5>
                            </div>
                            <div>
                                <img src="https://via.placeholder.com/200x300" alt="Product image" className="h-60 object-cover" />
                            </div>
                            <p className="mt-5 text-sm text-gray-500">Click the image to edit or update</p>

                            <p className="mt-5 cursor-pointer text-danger underline">Remove product image</p>
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Gallery</h5>
                            </div>
                            <div>
                                <img src="https://via.placeholder.com/100x100" alt="Product image" className=" object-cover" />
                            </div>

                            <p className="mt-5 cursor-pointer text-primary underline">Add product gallery images</p>
                            <button type="button" className="btn btn-primary mt-5" onClick={() => setproductVideoPopup()}>
                                + Video
                            </button>
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Categories</h5>
                            </div>

                            <div className="mb-5">
                                {isMounted && (
                                    <Tab.Group>
                                        <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                            <Tab as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        className={`${selected ? '!border-white-light !border-b-white text-danger dark:!border-[#191e3a] dark:!border-b-black' : ''}
                                                -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                    >
                                                        All Categories
                                                    </button>
                                                )}
                                            </Tab>
                                            <Tab as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        className={`${selected ? '!border-white-light !border-b-white text-danger dark:!border-[#191e3a] dark:!border-b-black' : ''}
                                                -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                    >
                                                        Most Used
                                                    </button>
                                                )}
                                            </Tab>
                                        </Tab.List>
                                        <Tab.Panels className="flex-1 border border-t-0 border-white-light p-4 text-sm  dark:border-[#191e3a]">
                                            <Tab.Panel>
                                                <div className="active">
                                                    <div className="pb-3">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Anklets</span>
                                                    </div>

                                                    <div className="pb-3 pl-5">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Kada</span>
                                                    </div>

                                                    <div className="pb-3 pl-5">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Rope Anklet</span>
                                                    </div>

                                                    <div className="pb-3">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Bangles & Bracelets</span>
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                <div className="active">
                                                    <div className="pb-3">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Anklets</span>
                                                    </div>

                                                    <div className="pb-3">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Kada</span>
                                                    </div>

                                                    <div className="pb-3">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>Rope Anklet</span>
                                                    </div>
                                                </div>
                                            </Tab.Panel>

                                            <Tab.Panel>Disabled</Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                )}
                            </div>
                            <p className="cursor-pointer text-primary underline" onClick={() => addCategoryClick()}>
                                {addCategory ? 'Cancel' : '+ Add New Category'}
                            </p>
                            {addCategory && (
                                <>
                                    <div>
                                        <input type="text" className="form-input mt-3" placeholder="Category Name" />
                                        <select name="parent-category" id="parent-category" className="form-select mt-3">
                                            <option>Anklets</option>
                                            <option>__Black Thread</option>
                                            <option>__Kada</option>
                                        </select>
                                        <button type="button" className="btn btn-primary mt-3">
                                            Add New Category
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Tags</h5>
                            </div>
                            <div className="mb-5 flex">
                                <input type="text" className="form-input mr-3 mt-3" placeholder="Product Tags" />
                                <button type="button" className="btn btn-primary mt-3">
                                    Add
                                </button>
                            </div>
                            <div>
                                <p className="mb-5 text-sm text-gray-500">Separate tags with commas</p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1">
                                        <IconX className="h-4 w-4 rounded-full border border-danger" />
                                        <p> 925 silver jewellery</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <IconX className="h-4 w-4 rounded-full border border-danger" />
                                        <p>Chennai</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <IconX className="h-4 w-4 rounded-full border border-danger" />
                                        <p>jewels prade</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <IconX className="h-4 w-4 rounded-full border border-danger" />
                                        <p>Kundan Earrings</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <IconX className="h-4 w-4 rounded-full border border-danger" />
                                        <p>prade love</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* product video popup */}
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
                                        <div className="text-lg font-bold">Product gallery video</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="m-5">
                                        {isMounted && (
                                            <Tab.Group>
                                                <Tab.List className="mt-3 flex flex-wrap justify-start space-x-2 border p-1 w-44  rtl:space-x-reverse">
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'bg-primary text-white !outline-none' : ''}
                                                    ' -mb-[1px] block rounded p-3.5 py-2 hover:bg-primary hover:text-white`}
                                                            >
                                                                MP4
                                                            </button>
                                                        )}
                                                    </Tab>
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'bg-primary text-white !outline-none' : ''}
                                                    ' -mb-[1px] block rounded p-3.5 py-2 hover:bg-primary hover:text-white`}
                                                            >
                                                                Youtube
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>
                                                <Tab.Panels>
                                                    <Tab.Panel>
                                                        <div className="active pt-5">
                                                            <label htmlFor="product-gallery-video" className="form-label mb-5 border-b  pb-3 text-gray-600">
                                                                MP4 video file
                                                            </label>
                                                            <input type="file" id="product-gallery-video" className="form-input" />
                                                            <span className='text-gray-600 text-sm pt-5'>Upload a new or select (.mp4) video file from the media library.</span>
                                                        </div>
                                                        <button className="btn btn-primary mt-5">Save</button>
                                                    </Tab.Panel>
                                                    <Tab.Panel>
                                                    <div className="active pt-5">
                                                            <label htmlFor="product-gallery-video" className="form-label mb-5 border-b  pb-3 text-gray-600">
                                                            YouTube video URL
                                                            </label>
                                                            <input type="text" id="product-gallery-video" className="form-input" />
                                                            <span className='text-gray-600 text-sm pt-5'>Example: https://youtu.be/LXb3EKWsInQ</span>
                                                        </div>
                                                        <button className="btn btn-primary mt-5">Save</button>
                                                    </Tab.Panel>

                                                    <Tab.Panel>Disabled</Tab.Panel>
                                                </Tab.Panels>
                                            </Tab.Group>
                                        )}
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

export default ProductEdit;
