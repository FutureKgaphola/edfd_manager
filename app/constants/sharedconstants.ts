const procurementDef = `A Procurement Loan is a type of financing designed to help businesses or organizations
                                acquire goods, services, or raw materials needed for their operations. Typically used in
                                industries like construction, manufacturing, or retail, it provides the capital required to
                                purchase inventory or equipment without draining working capital. Procurement loans are
                                often short-term and can be used for various purposes.`;
const franchiseDef = `A franchise loan is a type of business loan designed 
specifically for individuals or businesses looking to open, acquire, or expand a franchise. These 
loans help cover various costs associated with starting and running a franchise`;
const BuildingDef = `A building loan, also known as a construction loan, is a short-term loan designed to finance 
the construction or renovation of a building. `;
const BusinessDef = `A business loan is a type of financing that provides capital
 to businesses for various purposes, such as expansion, working capital, equipment
  purchase, or operational expenses. These loans can be 
secured (requiring collateral) or unsecured (based on creditworthiness).`;
const Lorems = `Lorem Ipsum is simply dummy text of the printing and typesetting
 industry. Lorem Ipsum has been the industry's standard dummy text ever since 
 the 1500s, when an unknown printer took a galley of type and scrambled it to
  make a type specimen book.`

const BusinesDocs = [
  {
    id: 0, desc: 'Cession Agreement'
  },
  {
    id: 1, desc: 'Resolution for delegationof authority to act on behalf of the company if there is more than one memeber/director'
  },
  {
    id: 2, desc: 'Lease Agreement/Letter of Intent to Lease/Proof of Business Address'
  },
  {
    id: 3, desc: 'Affidavit declaring the company address of registered Office',
  },
  {
    id: 4, desc: 'Three/Six months bank statement of an active business'
  },
  {
    id: 5, desc: 'Quotation with bankng details for the respective supplier and delivery cost (Delivery cost can be free, included OR charged for Delivery/Transport)'
  },
  {
    id: 6, desc: 'Declaration in case of unmarried applicant (Affidavit)/Copy of Death certificate in case of widow/widower/copy of degree of devorce in case of divorcee/copy of Marriage certificate in case od married couple'
  },
  {
    id: 7, desc: 'Statement of personal Assets and Liabilities of memebers/directors of the company. (click on the link below to download the form)'
  }
];

const ProcurementDocs = [
  {
    id: 0, p: 'Appointment Letter/Order/JBCC contract/Service Level Agrement & Specification*', li: []
  },
  {
    id: 1, p: "Resolution for delegationof authority to act on behalf of the company if there is more than one memeber/director*", li: []
  },
  { id: 2, p: 'Lease Agreement/Letter of Intent to Lease/Proof of Business Address *', li: [] },
  {
    id: 3, p: 'Affidavit declaring the company address of registration Office *', li: []
  },
  { id: 4, p: 'Three months bank statement of an active business *', li: [] },
  {
    id: 5, p: `Quotation with bankng details for the respective supplier and delivery cost
(Delivery cost can be free, included OR charged for Delivery/Transport) *`, li: []
  },
  {
    id: 6, p: 'If you are aware of that you are listed, then attach one of the following',
    li: [
      { li: 'Proof of payment if debt is settled in full' },
      { li: 'A latter from the creditor indicating the nature of thepayment arrangements if the dept is still having an outstanding.' },
      {
        li: 'Proof of payment'

      }]
  },
  {
    id: 7, p: `Declaration in case of unmarried applicant (Affidavit)/Copy of Death certificate in case of
widow/widower/copy of degree of devorce in case of divorcee/copy of Marriage certificate in case od married couple *`, li: []
  },
  { id: 8, p: `Statement of personal Assets and Liabilities of memebers/directors of the company. (click on the link to download the form) *`, li: [] },
];

export interface History {
  id: string;
  date: string;
  status: string;
  category: string;
  Company:string;
  RegNo: string;
  body: string;
  stage?: string;
  outcome?: string;
}


const isValidateCompanyRegNumber = (regNum: string): boolean => {
  const sectors = ['07', '06', '08', '23', '21', '30', '10'];

  // Ensure the format follows YYYY/NNNNNN/XX
  const regex = /^\d{4}\/\d{6}\/\d{2}$/;
  if (!regex.test(regNum)) return false;

  // Extract Year and Sector Code
  const year = parseInt(regNum.substring(0, 4), 10);
  const sectorCode = regNum.slice(-2); // Extract last two characters

  // Validate year range and sector code
  const currentYear = new Date().getFullYear();
  return year >= 2008 && year <= currentYear && sectors.includes(sectorCode);
};

function validateSAID(idNumber: string): boolean {
  // Ensure the ID number is exactly 13 digits and numeric
  if (!/^\d{13}$/.test(idNumber)) {
    return false;
  }

  // Extract birth date (first 6 digits: YYMMDD)
  const year = parseInt(idNumber.substring(0, 2), 10);
  const month = parseInt(idNumber.substring(2, 4), 10);
  const day = parseInt(idNumber.substring(4, 6), 10);

  // Adjust year for 1900s or 2000s
  const currentYear = new Date().getFullYear() % 100;
  const fullYear = year > currentYear ? 1900 + year : 2000 + year;

  // Validate birth date
  const date = new Date(fullYear, month - 1, day);
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  // Luhn Algorithm Check
  let sum = 0;
  let doubleUp = false;
  for (let i = idNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(idNumber.charAt(i), 10);
    if (doubleUp) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    doubleUp = !doubleUp;
  }

  return sum % 10 === 0; // Valid if Luhn checksum passes
}

export { Lorems, procurementDef, franchiseDef, BuildingDef, BusinessDef, isValidateCompanyRegNumber, validateSAID, BusinesDocs, ProcurementDocs }
