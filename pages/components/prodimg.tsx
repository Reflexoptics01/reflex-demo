import { store } from "../home";
import { ref, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Prodimg(props) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    try {
      const imageref = ref(store, props.id);
    getDownloadURL(imageref).then((url) => {
      setUrl(url);
    });
    } catch (error) {
      
    }
  }, []);

  return (
    <div>{url && <Image src={url} width={100} height={100} alt={""} />}</div>
  );
}
