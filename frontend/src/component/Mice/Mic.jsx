import react from 'react'
import Webcam from "react-webcam"
import { useRef,useState } from 'react'
function Mic() {
    const webcamRef = useRef(null);
    const [recording, setrecording] = useState(true);
    const handleMic = () => {
        if (webcamRef.current) {
            const stream = webcamRef.current.stream;
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
            mediaRecorder.onstop = () => {
                const videoBlob = new Blob(chunks, { type: "video/webm" });
                setAudioURL(URL.createObjectURL(videoBlob));
            };
            mediaRecorder.start();
            setrecording(false);
        }

    }
    
    return (
        <>
        
         
            
            <Webcam ref={webcamRef} width="400" height="300" />
        
        <div className='flex item-center gap-3'>
           
           <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xl rounded-lg px-4 py-1 my-2 cursor-pointer'>
            Mic
           </div>
           <div>
           

            <button onClick={()=>handleMic()} className='bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xl rounded-lg px-4 py-1 my-2'>
              Camera
            </button>
            
           </div>
        </div>
        </>
       
    )
}
export default Mic;