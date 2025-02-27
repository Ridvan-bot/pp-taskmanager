import React from 'react';
import { WorkSpaceProps } from '../../types/index'

const WorkSpace: React.FC<WorkSpaceProps> = ({selectedCustomer}) => {
  return (
    <div>
      <h1>Selected Costumer</h1>
      <p>{selectedCustomer}</p>
    </div>
  );
};

export default WorkSpace;