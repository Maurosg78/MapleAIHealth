import * as React from 'react';
import { EMRDemoPage } from '../components/emr';

const EMRDemo: React.FC = () => {
  return React.createElement('div',
    { className: "min-h-screen bg-gray-100" },
    React.createElement(EMRDemoPage, {})
  );
};

export default EMRDemo;
