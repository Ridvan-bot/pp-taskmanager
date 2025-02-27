export type Customer = 'Aspia' | 'Lantmännen' | 'Kvadrat' | '';

export type HeaderProps = {
  setSelectedCustomer: (customer: Customer) => void;
};

export type WorkSpaceProps = {
  selectedCustomer: Customer;
};