import React, { useState } from 'react';


const Upload = () => {


    return (
        <div>
        <div className="flex w-318 h-148 mt-1 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">

                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
                <div className="py-20 px-2">

                    <div className="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
                        <div className="md:flex">
                            <div className="w-full p-3">
                                <div className="relative border-dotted h-48 rounded-lg border-2 border-blue-700 bg-gray-100 flex justify-center items-center">
                                    <div className="absolute">

                                        <div className="flex flex-col items-center">
                                            <i className="fa fa-folder-open fa-4x text-blue-700"></i>
                                            <span className="block text-gray-400 font-normal">Solte seu arquivo aqui</span>
                                        </div>
                                    </div>
                                    <input type="file" className="h-full w-full opacity-0" name="" />
                                </div>
                            </div>
                        </div>
                        <br />
                       
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Upload
