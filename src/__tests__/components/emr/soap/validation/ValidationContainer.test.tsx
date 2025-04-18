import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ValidationContainer } from '../../../../../components/emr/soap/validation/ValidationContainer';
import { validateRequiredFields } from '../../../../../components/emr/soap/validation/RequiredFieldsConfig';
import { SubjectiveData } from '../../../../../types/clinical';

// Mock para la función validateRequiredFields
jest.mock('../../../../../components/emr/soap/validation/RequiredFieldsConfig', () => ({
  validateRequiredFields: jest.fn()
}));

// Tipo de datos de prueba para utilizar en lugar de any
type TestData = Pick<SubjectiveData, 'chiefComplaint'>;

describe('ValidationContainer', () => {
  beforeEach(() => {
    // Resetear el mock antes de cada prueba
    jest.clearAllMocks();
  });
  
  test('renders error messages when validation fails and showValidation is true', () => {
    // Configurar el mock para devolver errores
    (validateRequiredFields as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Campo requerido 1', 'Campo requerido 2']
    });
    
    const mockData: TestData = { chiefComplaint: 'someValue' };
    
    const { getByText } = render(
      <ValidationContainer 
        data={mockData as SubjectiveData}
        specialty="physiotherapy"
        section="subjective"
        showValidation={true}
      />
    );
    
    // Verificar que los mensajes de error estén presentes
    expect(getByText('Campos requeridos faltantes:')).toBeInTheDocument();
    expect(getByText('Campo requerido 1')).toBeInTheDocument();
    expect(getByText('Campo requerido 2')).toBeInTheDocument();
    
    // Verificar que se llamó a la función de validación con los parámetros correctos
    expect(validateRequiredFields).toHaveBeenCalledWith(
      mockData,
      'physiotherapy',
      'subjective'
    );
  });
  
  test('does not render when validation is successful', () => {
    // Configurar el mock para indicar validación exitosa
    (validateRequiredFields as jest.Mock).mockReturnValue({
      valid: true,
      errors: []
    });
    
    const mockData: TestData = { chiefComplaint: 'someValue' };
    
    const { container } = render(
      <ValidationContainer 
        data={mockData as SubjectiveData}
        specialty="physiotherapy"
        section="subjective"
        showValidation={true}
      />
    );
    
    // Si la validación es exitosa, no debería renderizar nada
    expect(container.firstChild).toBeNull();
  });
  
  test('does not render when showValidation is false', () => {
    // Configurar el mock para devolver errores, pero showValidation es false
    (validateRequiredFields as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Campo requerido']
    });
    
    const mockData: TestData = { chiefComplaint: 'someValue' };
    
    const { container } = render(
      <ValidationContainer 
        data={mockData as SubjectiveData}
        specialty="physiotherapy"
        section="subjective"
        showValidation={false}
      />
    );
    
    // No debería renderizar nada si showValidation es false
    expect(container.firstChild).toBeNull();
    
    // Verificar que no se llamó a la función de validación
    expect(validateRequiredFields).not.toHaveBeenCalled();
  });
  
  test('applies custom className to the ValidationErrorsDisplay', () => {
    // Configurar el mock para devolver errores
    (validateRequiredFields as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Campo requerido']
    });
    
    const mockData: TestData = { chiefComplaint: 'someValue' };
    const customClass = 'test-custom-class';
    
    const { getByRole } = render(
      <ValidationContainer 
        data={mockData as SubjectiveData}
        specialty="physiotherapy"
        section="subjective"
        showValidation={true}
        className={customClass}
      />
    );
    
    // Verificar que la clase personalizada se pasa al componente de errores
    const errorDisplay = getByRole('alert');
    expect(errorDisplay.classList.contains(customClass)).toBe(true);
  });
}); 