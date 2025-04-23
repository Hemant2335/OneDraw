import {useRef, useState} from 'react';

const UrlCopyField = ({ url }: { url: string }) => {
    const [isCopied, setIsCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        if (!inputRef.current) return;

        // Select the text
        inputRef.current.select();
        inputRef.current.setSelectionRange(0, 99999); // For mobile

        // Copy to clipboard
        navigator.clipboard.writeText(url)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="flex items-center my-2 gap-2 w-full max-w-lg">
            <div className="relative flex-grow">
                <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    readOnly
                    className="w-full p-2 pr-16 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleCopy}
                />
            </div>
            <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={isCopied}
            >
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};

export default UrlCopyField;