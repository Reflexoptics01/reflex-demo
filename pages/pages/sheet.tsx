import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Table, Button, Input, Modal } from 'antd';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../components/firebase-config';

const Sheet = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editedRows, setEditedRows] = useState({});
    const [editedCells, setEditedCells] = useState({});
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'contact'));
            const documents = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setData(documents.sort((a, b) => Number(a.id) - Number(b.id)));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleChange = (value, record, dataIndex) => {
        const newData = [...data];
        const index = newData.findIndex((item) => record.id === item.id);
        const item = newData[index];
        if (['sphL', 'sphU', 'cylL', 'cylU', 'add', 'price', 'mrp'].includes(dataIndex)) {
            item[dataIndex] = parseFloat(value).toString();
        } else {
            item[dataIndex] = value;
        }
        setData(newData);
        setEditedRows({ ...editedRows, [record.id]: true });
        setEditedCells({ ...editedCells, [`${record.id}-${dataIndex}`]: true });
    };

    const saveChanges = async () => {
        const editedIds = Object.keys(editedRows).filter(id => editedRows[id]);
        if (editedIds.length === 0) {
            alert('No changes to save.');
            return;
        }

        Modal.confirm({
            title: 'Confirm Changes',
            content: `Are you sure you want to save changes for the following IDs: ${editedIds.join(', ')}?`,
            onOk: async () => {
                try {
                    setLoading(true);
                    for (const item of data) {
                        if (editedRows[item.id]) {
                            const docRef = doc(db, 'contact', item.id);
                            await updateDoc(docRef, item);
                        }
                    }
                    setLoading(false);
                    setEditedRows({});
                    setEditedCells({});
                    alert('Changes saved successfully!');
                } catch (error) {
                    console.error('Error saving changes:', error);
                    setLoading(false);
                    alert('Error saving changes. Please try again.');
                }
            },
            okButtonProps: { style: { backgroundColor: 'red', borderColor: 'gray' } },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => Number(a.id) - Number(b.id),
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'id')}
                    style={{ backgroundColor: editedCells[`${record.id}-id`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'company')}
                    style={{ backgroundColor: editedCells[`${record.id}-company`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'brand')}
                    style={{ backgroundColor: editedCells[`${record.id}-brand`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Lens Type',
            dataIndex: 'lensType',
            key: 'lensType',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'lensType')}
                    style={{ backgroundColor: editedCells[`${record.id}-lensType`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Modality',
            dataIndex: 'modality',
            key: 'modality',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'modality')}
                    style={{ backgroundColor: editedCells[`${record.id}-modality`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Pack Size',
            dataIndex: 'pack',
            key: 'pack',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'pack')}
                    style={{ backgroundColor: editedCells[`${record.id}-pack`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'type')}
                    style={{ backgroundColor: editedCells[`${record.id}-type`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Colour',
            dataIndex: 'colour',
            key: 'colour',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'colour')}
                    style={{ backgroundColor: editedCells[`${record.id}-colour`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'SPH Lower',
            dataIndex: 'sphL',
            key: 'sphL',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'sphL')}
                    style={{ backgroundColor: editedCells[`${record.id}-sphL`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'SPH Upper',
            dataIndex: 'sphU',
            key: 'sphU',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'sphU')}
                    style={{ backgroundColor: editedCells[`${record.id}-sphU`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'CYL Lower',
            dataIndex: 'cylL',
            key: 'cylL',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'cylL')}
                    style={{ backgroundColor: editedCells[`${record.id}-cylL`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'CYL Upper',
            dataIndex: 'cylU',
            key: 'cylU',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'cylU')}
                    style={{ backgroundColor: editedCells[`${record.id}-cylU`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Axis',
            dataIndex: 'axis',
            key: 'axis',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'axis')}
                    style={{ backgroundColor: editedCells[`${record.id}-axis`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Add',
            dataIndex: 'add',
            key: 'add',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'add')}
                    style={{ backgroundColor: editedCells[`${record.id}-add`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'price')}
                    style={{ backgroundColor: editedCells[`${record.id}-price`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
        {
            title: 'MRP',
            dataIndex: 'mrp',
            key: 'mrp',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(e.target.value, record, 'mrp')}
                    style={{ backgroundColor: editedCells[`${record.id}-mrp`] ? '#ffcccb' : 'transparent' }}
                />
            ),
        },
    ];

    return (
        <div className=' pt-10 '>
            <h1>Contact Sheet</h1>
            <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                rowClassName={(record) => editedRows[record.id] ? 'highlighted-row' : ''}
            />
            <div className='bg-white sticky bottom-0 left-0 drop-shadow-2xl right-0 p-5'>
                <Button
                    type="primary"
                    onClick={saveChanges}
                    className="no-print  flex mt-50 max-w-max items-center justify-center rounded-md border border-transparent bg-green-500 px-4 py-3 text-base font-medium text-white hover:bg-green-600 md:py-4 md:px-4 md:text-lg cursor-pointer"
                    loading={loading}
                >
                    Save Changes
                </Button>
            </div>

        </div>
    );
};

export default Sheet;