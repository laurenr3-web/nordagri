
import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrength: number;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  passwordStrength,
}) => {
  if (!password) return null;

  let strengthText = "";
  let strengthColor = "";

  if (passwordStrength <= 25) {
    strengthText = "Faible";
    strengthColor = "bg-red-500";
  } else if (passwordStrength <= 50) {
    strengthText = "Moyen";
    strengthColor = "bg-yellow-500";
  } else if (passwordStrength <= 75) {
    strengthText = "Bon";
    strengthColor = "bg-blue-500";
  } else {
    strengthText = "Fort";
    strengthColor = "bg-green-500";
  }

  return (
    <div className="space-y-2">
      <div className="h-1 w-full bg-gray-200 rounded-full">
        <div
          className={`h-1 rounded-full ${strengthColor}`}
          style={{ width: `${passwordStrength}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Force du mot de passe: {strengthText}</span>
        <span>{passwordStrength}%</span>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>Pour un mot de passe fort, utilisez :</p>
        <ul className="list-disc list-inside pl-2">
          <li className={password.length >= 8 ? "text-green-600" : ""}>
            Au moins 8 caractères
          </li>
          <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
            Une lettre majuscule
          </li>
          <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
            Un chiffre
          </li>
          <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>
            Un caractère spécial
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
