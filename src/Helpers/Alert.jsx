import React, { useState, useEffect } from 'react';

// Definindo um objeto com as configurações de estilos para cada tipo de alerta
const alertStyles = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
    iconColor: 'text-green-400',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
      </svg>
    ),
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
    iconColor: 'text-red-400',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8 3a1 1 0 00-1-1H9a1 1 0 000 2h2a1 1 0 001-1zm0-4a1 1 0 00-1-1H9a1 1 0 000 2h2a1 1 0 001-1z" clipRule="evenodd"></path>
      </svg>
    ),
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    iconColor: 'text-blue-400',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v4a1 1 0 01-2 0v-4a1 1 0 011-1zm0-4a1 1 0 011 1v2a1 1 0 01-2 0V6a1 1 0 011-1z" clipRule="evenodd"></path>
      </svg>
    ),
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    iconColor: 'text-yellow-400',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8 3a1 1 0 00-1-1H9a1 1 0 000 2h2a1 1 0 001-1zm0-4a1 1 0 00-1-1H9a1 1 0 000 2h2a1 1 0 001-1z" clipRule="evenodd"></path>
      </svg>
    ),
  },
};

const Alert = ({ tipo, mensagem, tempo }) => {
  const [alertIsOn, setAlertIsOn] = useState(false);
  const tempoDeSumir = tempo * 1000;

  const alertConfig = alertStyles[tipo] || alertStyles.success;

  useEffect(() => {
    setAlertIsOn(true);

    const timeout = setTimeout(() => {
      setAlertIsOn(false);
    }, tempoDeSumir);

    return () => clearTimeout(timeout);
  }, [tempoDeSumir]);

  return (
    <div>
      {alertIsOn ? (
        <div className="absolute items-center w-full mx-auto md:px-12 z-50">
          <div className={`p-6 border-l-4 ${alertConfig.borderColor} -6 rounded-r-xl ${alertConfig.bgColor}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {alertConfig.icon && <div className={`w-5 h-5 ${alertConfig.iconColor}`}>{alertConfig.icon}</div>}
              </div>
              <div className="ml-3">
                <div className={`text-sm ${alertConfig.textColor}`}>
                  <p>{mensagem}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Alert;
