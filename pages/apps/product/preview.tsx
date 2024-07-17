import { RELATED_PRODUCT } from '@/query/product';
import { addCommasToNumber, isEmptyObject, sampleParams, useSetState } from '@/utils/functions';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { COLOR_LIST, DESIGN_LIST, FINISH_LIST, PRODUCT_TYPE_LIST, SIZE_LIST, STONE_LIST, STYLE_LIST, TYPE_LIST } from '@/query/product';

export default function Preview() {
    const router = useRouter();

    const productPreview = useSelector((state: any) => state?.authConfig?.productPreview);
    console.log('productPreview: ', productPreview);

    const { data: relatedProduct } = useQuery(RELATED_PRODUCT, {
        variables: {
            id: "Q2F0ZWdvcnk6NzA=",
            channel: 'india-channel',
        },
    });

    const { data: productTypelist } = useQuery(PRODUCT_TYPE_LIST, {
        variables: sampleParams,
    });

    const { data: finishData, refetch: finishRefetch } = useQuery(FINISH_LIST, {
        variables: sampleParams,
    });

    const { data: stoneData, refetch: stoneRefetch } = useQuery(STONE_LIST, {
        variables: sampleParams,
    });
    const { data: designData, refetch: designRefetch } = useQuery(DESIGN_LIST, {
        variables: sampleParams,
    });
    const { data: styleData, refetch: styleRefetch } = useQuery(STYLE_LIST, {
        variables: sampleParams,
    });

    const { data: stoneColorData, refetch: stoneColorRefetch } = useQuery(COLOR_LIST, {
        variables: sampleParams,
    });

    const { data: typeData, refetch: typeRefetch } = useQuery(TYPE_LIST, {
        variables: sampleParams,
    });

    const { data: sizeData, refetch: sizeRefetch } = useQuery(SIZE_LIST, {
        variables: sampleParams,
    });

    useEffect(() => {
        Attributes();
    }, []);

    console.log('relatedProduct: ', relatedProduct);

    const [state, setState] = useSetState({
        image: '',
    });

    const attributesMap = {
        type: 'Type',
        design: 'Design',
        stone: 'Stone',
        finish: 'Finish',
        stoneColor: 'Stone Color',
        size: 'Size',
        style: 'Style',
    };

    const Attributes = async () => {
        const styleRes = await styleRefetch({
            sampleParams,
        });

        const designRes = await designRefetch({
            sampleParams,
        });

        const finishRes = await finishRefetch({
            sampleParams,
        });

        const stoneTypeRes = await stoneRefetch({
            sampleParams,
        });

        const stoneColorRes = await stoneColorRefetch({
            sampleParams,
        });

        const typeRes = await typeRefetch({
            sampleParams,
        });

        const sizeRes = await sizeRefetch({
            sampleParams,
        });

        const arr1 = {
            design: designRes?.data?.productDesigns,
            style: styleRes?.data?.productStyles,
            finish: finishRes?.data?.productFinishes,
            stoneType: stoneTypeRes?.data?.productStoneTypes,
            stoneColor: stoneColorRes?.data?.stoneColors,
            type: typeRes?.data?.itemTypes,
            size: sizeRes?.data?.sizes,
        };

        console.log("arr1: ", arr1);

        const singleObj = Object.entries(arr1).reduce((acc: any, [key, value]) => {
            acc[key] = value?.edges.map(({ node }: any) => ({ value: node?.id, label: node?.name }));
            return acc;
        }, {});


        const arr = [];
        const type: any[] = [];
        let selectedAccValue: any = {};

        const attributes = [
            { key: 'prouctDesign', type: 'design', name: 'designName', dropdowndataKey: 'design' },
            { key: 'productstyle', type: 'style', name: 'styleName', dropdowndataKey: 'style' },
            { key: 'productStoneType', type: 'stone', name: 'stoneName', dropdowndataKey: 'stoneType' },
            { key: 'productFinish', type: 'finish', name: 'finishName', dropdowndataKey: 'finish' },
            { key: 'productStonecolor', type: 'stoneColor', name: 'stoneColorName', dropdowndataKey: 'stoneColor' },
            { key: 'productItemtype', type: 'type', name: 'typeName', dropdowndataKey: 'type' },
            { key: 'productSize', type: 'size', name: 'sizeName', dropdowndataKey: 'size' },
        ];

        attributes.forEach((attribute) => {
            if (productPreview?.attributes?.[attribute.key]?.length > 0) {
                const obj = {
                    type: attribute.type,
                    [attribute.name]: singleObj?.[attribute.dropdowndataKey],
                };
                arr.push(obj);
                type.push(attribute.type);
                selectedAccValue[attribute.type] = productPreview?.attributes?.[attribute.key].map((item: any) => item.id);
            }
        });
        console.log("attributes: ", attributes);
        console.log("arr.flat(): ", arr.flat());


        // setAccordions(arr.flat());
        // setSelectedArr(type);
        // setSelectedValues(selectedAccValue);
    };

    return (
        <div className="flex h-full w-full gap-3">
            <div className="panel flex h-full w-2/12 flex-col items-center">
                {productPreview?.image?.length > 0 ? (
                    productPreview?.image?.map((item, index) => (
                        <div key={index} className="h-100 w-[200px] cursor-pointer overflow-hidden p-2" onClick={() => setState({ image: item })}>
                            <img src={item} alt="image" className="object-contain" />
                        </div>
                    ))
                ) : (
                    <div className="h-100 w-[200px] cursor-pointer overflow-hidden p-2">
                        <img src={'/assets/images/placeholder.png'} alt="image" className="object-contain" />
                    </div>
                )}
            </div>
            {productPreview?.image?.length > 0 ? (
                <div className="panel h-[500px] w-4/12">
                    <img src={state.image ? state.image : productPreview?.image[0]} alt="image" style={{ width: '100%', height: '100%' }} />
                </div>
            ) : (
                <div className="panel h-[500px] w-4/12">
                    <img src={'/assets/images/placeholder.png'} alt="image" style={{ width: '100%', height: '100%' }} />
                </div>
            )}
            <div className="panel h-full w-5/12">
                {productPreview?.name && (
                    <label htmlFor="name" className="block text-2xl font-medium text-gray-700">
                        {productPreview?.name}
                    </label>
                )}
                {productPreview?.variants?.length > 0 && (
                    <div className="flex gap-4">
                        {productPreview?.variants?.map(
                            (item, index) =>
                                item?.salePrice !== 0 && (
                                    <label key={index} htmlFor="name" className="block text-2xl font-medium text-gray-700">
                                        ₹{addCommasToNumber(item?.salePrice)}
                                    </label>
                                )
                        )}
                    </div>
                )}
                {productPreview?.shortDescription && (
                    <label htmlFor="name" className="block text-2xl font-medium text-gray-700">
                        {productPreview?.shortDescription}
                    </label>
                )}
                <div className="panel w-full">
                    <div
                        style={{
                            borderBottom: '1px solid #EAEBED',
                            paddingBottom: '15px',
                            marginBottom: '15px',
                        }}
                    >
                        {productPreview?.description?.blocks?.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                }}
                            >
                                <div className={`${productPreview?.description ? 'theme-color' : ''}`}>MAINTENANCE TIPS</div>
                                <div>{productPreview.description ? '▲' : '▼'}</div>
                            </div>
                        )}
                        {productPreview?.description && (
                            <>
                                {productPreview?.description?.blocks?.map((block, index) => (
                                    <div key={index} style={{ marginTop: '10px' }}>
                                        {block?.type === 'header' && <h5 style={{ fontWeight: '400' }}>{block?.data?.text}</h5>}
                                        {block.type === 'paragraph' && (
                                            <p style={{ color: 'gray', marginBottom: '5px' }}>
                                                {block.data.text && (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: block.data.text.includes('<b>') ? `<b>${block.data.text}</b>` : block.data.text,
                                                        }}
                                                    />
                                                )}
                                            </p>
                                        )}
                                        {block.type === 'list' && (
                                            <ul style={{ paddingLeft: '20px' }}>
                                                {block.data.items?.map((item, itemIndex) => (
                                                    <li
                                                        key={itemIndex}
                                                        style={{ color: 'gray' }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: item.includes('<b>') ? `<b>${item}</b>` : item,
                                                        }}
                                                    />
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    {!isEmptyObject(productPreview?.attibutes) && (
                        <div
                            style={{
                                borderBottom: '1px solid #EAEBED',
                                paddingBottom: '15px',
                                marginBottom: '15px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                }}
                            >
                                <div>ADDITIONAL INFORMATION</div>
                                <div>▲</div>
                            </div>
                            <ul
                                style={{
                                    listStyleType: 'none',
                                    paddingTop: '10px',
                                    gap: 5,
                                }}
                            >
                                {Object.keys(attributesMap).map(
                                    (key) =>
                                        productPreview?.attibutes?.[key]?.length > 0 && (
                                            <li key={key}>
                                                <span style={{ fontWeight: 'bold' }}>{attributesMap[key]}: </span>
                                                {productPreview?.attibutes?.[key]?.map((item, index) => (
                                                    <span key={item} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                                        {item}
                                                        {index < productPreview?.attibutes?.[key]?.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </li>
                                        )
                                )}
                            </ul>
                        </div>
                    )}
                    {productPreview?.variants?.length > 0 && productPreview?.variants[0]?.sku !== '' && (
                        <div className="flex gap-3">
                            <span style={{ fontWeight: 'bold' }}>SKU : </span>
                            {productPreview?.variants?.map((item, index) => (
                                <span key={item?.value} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                    {item?.sku}
                                    {index < productPreview?.variants?.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>
                    )}
                    {productPreview?.category?.length > 0 && (
                        <div className="flex gap-3">
                            <span style={{ fontWeight: 'bold' }}>Categories : </span>
                            {productPreview?.category?.map((item, index) => (
                                <span key={item?.value} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                    {item?.label}
                                    {index < productPreview?.category?.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
