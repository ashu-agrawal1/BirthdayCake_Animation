import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../component/cake.css';

function Candle({ left, top, out }) {
  return (
    <div>
      <div>
        <motion.div
          className="candle"
          style={{ left: `${left}px`, top: `${top}px` }}
          animate={{ y: 0 }}
          initial={{ y: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.5 }}
        >
          {!out && (
            <div className="flame">
              <motion.div
                animate={{ y: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 1.5 }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function Cake() {
  const [blowing, setBlowing] = useState();
  const dripRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [temp, setTemp] = useState("");

  useEffect(() => {
    if (!blowing) return;
    let timeout = setTimeout(() => {
      setBlowing(false);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [blowing]);

  useEffect(() => {
    if (!blowing) return;
    setCandles((prevCandles) =>
      prevCandles.map((candle) => ({
        ...candle,
        out: candle.out ? true : Math.random() < 0.05,
      }))
    );
  }, [blowing]);

  useEffect(() => {
    let isMounted = true;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (!isMounted) return; // Check if the component is still mounted

        const audioContext = new AudioContext();
        const analyzer = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        // Connect the microphone to the Analyzer
        microphone.connect(analyzer);
        analyzer.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        // Define the loudness threshold
        const loudnessThreshold = 50;

        scriptProcessor.addEventListener('audioprocess', () => {
          const array = new Uint8Array(analyzer.frequencyBinCount);
          analyzer.getByteFrequencyData(array);
          let sum = 0;
          for (let i = 0; i < array.length; i++) {
            sum += array[i];
          }
          const avg = sum / array.length;

          // Check if the average volume exceeds the loudness threshold
          if (avg > loudnessThreshold && isMounted) {
            console.log('Loud sound detected');
            setBlowing(Date.now());
          }
        });
      })
      .catch((err) => {
        console.log(err);
        alert("You need to allow microphone to access this site")
        setTemp("ldsfl")
      });

    // Cleanup function to handle unmounting
    return () => {
      isMounted = false;
    };
  }, [temp]);

  return (
    <div>
      <h1 className='heading'>Please click on cake to add Candles</h1>
      <div className='input'>
        <input
          disabled
          value={candles.filter((candle) => !candle.out).length}
          placeholder='Place candles to start...'
        />
      </div>
      <div className="cake" onClick={(event) => {
        if (!dripRef.current) return;
        const rect = dripRef.current.getBoundingClientRect();
        setCandles([
          ...candles,
          {
            left: event.clientX - rect.left,
            top: -10 + Math.floor(30 * Math.random()),
            out: false,
          }
        ])
      }}>
        <div className="plate"></div>
        <div className="layer layer-bottom"></div>
        <div className="layer layer-middle"></div>
        <div className="layer layer-top"></div>
        <div className="icing">
          <div ref={dripRef}>
            <div>
              {candles.map((candle, i) => (
                <Candle
                  key={i}
                  left={candle.left}
                  top={candle.top}
                  out={candle.out}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="drip drip1"></div>
        <div className="drip drip2"></div>
        <div className="drip drip3"></div>
      </div>
      {candles?.length > 0 && <h3 className='heading' style={{ marginTop: "32%" }}>Give a strong blow to blow out the candles on the birthday cake</h3>}
    </div>
  );
}
