
export type Customer = 'Aspia' | 'Lantmännen' | 'Kvadrat' | '';

export type HeaderProps = {
  setSelectedCustomer: (customer: Customer) => void;
};

export type WorkSpaceProps = {
  selectedCustomer: Customer;
};

export type Task = {
    id: number;
    title: string;
    content: string;
    status: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
  };

  export type LoginModalProps = {
    isOpen: boolean;
    onRequestClose: () => void;
  };

  export type RegisterModalProps = {
    isOpen: boolean;
    onRequestClose: () => void;
  };