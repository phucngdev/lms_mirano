import { useEffect, useState } from 'react';

interface KanjiAPIComponentProps {
    character: string;
    repeatTrigger?: number;
}

export default function KanjiSVG({ character, repeatTrigger }: KanjiAPIComponentProps) {
    const [responseData, setResponseData] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const getUnicodeList = (text: string) => {
        if (!text) return [];
        return [...text].map(char => char.charCodeAt(0));
    };

    const prepareSVG = (svgString: string): string => {
        let cleaned = svgString.replace(/<animate[^>]*>/g, '');
        cleaned = cleaned.replace(/begin="[^"]*"/g, '');
        cleaned = cleaned.replace(/<path /g, '<path class="stroke-path" ');
        return cleaned;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!character) return;

            setLoading(true);
            setCurrentIndex(-1);

            const unicodeList = getUnicodeList(character);
            if (unicodeList.length === 0) {
                setLoading(false);
                return;
            }

            const payload = {
                lang: 'ja',
                data: unicodeList,
            };

            try {
                const response = await fetch('https://kanji.rikkei.edu.vn/samples/_php/fetchData.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    const cleanedSvgs = data.map((item: any) => prepareSVG(item.svg));
                    setResponseData(cleanedSvgs);
                } else {
                    setResponseData([]);
                }
            } catch (error) {
                console.error('Error fetching Kanji SVG:', error);
                setResponseData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [character, repeatTrigger]);

    useEffect(() => {
        if (responseData.length === 0 || currentIndex >= responseData.length - 1) return;

        const timeout = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [currentIndex, responseData]);

    useEffect(() => {
        if (responseData.length > 0) {
            setTimeout(() => setCurrentIndex(0), 500);
        }
    }, [responseData]);

    return (
        <>
            {loading ? (
                <p style={{ textAlign: 'center' }}>Đang tải nét viết...</p>
            ) : responseData.length > 0 ? (
                responseData.map((svg, index) => (
                    <div
                        key={index}
                        className={`kanji-svg-container ${index === currentIndex ? 'active' : ''}`}
                        dangerouslySetInnerHTML={{ __html: svg }}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            margin: '0 auto',
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '12px',
                        }}
                    />
                ))
            ) : (
                <p style={{ textAlign: 'center' }}>Không có nét viết cho 「{character}」</p>
            )}
        </>
    );
}
