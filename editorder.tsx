  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/router';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import { data } from "../home";

  const EditOrder = () => {
    const router = useRouter();
    const { id } = router.query;
    const [order, setOrder] = useState({
      customerName: '',
      items: [],
      total: 0,
      status: '',
      date: ''
    });

    useEffect(() => {
      if (id) {
        const fetchOrder = async () => {
          const orderDoc = await getDoc(doc(data, 'orders', id as string));
          if (orderDoc.exists()) {
            const orderData = orderDoc.data();
            setOrder({
              customerName: orderData.customerName || '',
              items: orderData.items || [],
              total: orderData.total || 0,
              status: orderData.status || '',
              date: orderData.date || ''
            });
          }
        };      fetchOrder();
      }
    }, [id]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await updateDoc(doc(data, 'orders', id as string), order);
        router.push('/orders');
      } catch (error) {
        console.error('Error updating order:', error);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setOrder(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Order</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={order.customerName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Items</label>
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...order.items];
                    newItems[index].name = e.target.value;
                    setOrder(prev => ({ ...prev, items: newItems }));
                  }}
                  className="w-1/2 p-2 border rounded"
                  placeholder="Item name"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...order.items];
                    newItems[index].quantity = parseInt(e.target.value);
                    setOrder(prev => ({ ...prev, items: newItems }));
                  }}
                  className="w-1/4 p-2 border rounded"
                  placeholder="Quantity"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => {
                    const newItems = [...order.items];
                    newItems[index].price = parseFloat(e.target.value);
                    setOrder(prev => ({ ...prev, items: newItems }));
                  }}
                  className="w-1/4 p-2 border rounded"
                  placeholder="Price"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block mb-2">Total Amount</label>
            <input
              type="number"
              name="total"
              value={order.total}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block mb-2">Status</label>
            <select
              name="status"
              value={order.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Order Date</label>
            <input
              type="date"
              name="date"
              value={order.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Order
          </button>
        </form>
      </div>
    );
  };

  export default EditOrder;
