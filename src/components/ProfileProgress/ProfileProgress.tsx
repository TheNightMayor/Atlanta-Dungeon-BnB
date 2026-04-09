import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

type Props = {
  createdAt?: string | null;
  profileImageUploaded?: boolean;
  idUploaded?: boolean;
  idVerified?: boolean;
};

const ProfileProgress: React.FC<Props> = ({ createdAt, profileImageUploaded, idUploaded, idVerified }) => {
  const formattedCreated = createdAt ? new Date(createdAt).toLocaleDateString('en-US') : undefined;

  const firstFour = [
    true,
    Boolean(profileImageUploaded),
    Boolean(idUploaded),
    Boolean(idVerified),
  ];

  const readyToBook = firstFour.every(Boolean);
  const allSteps = [...firstFour, readyToBook];
  const completedCount = allSteps.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / allSteps.length) * 100);

  return (
    <div className="w-full">
      <h3 className="hidden md:block md:text-lg font-semibold">Profile progress</h3>

      <div className="w-full py-2">
        <div className="relative md:py-6">
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-3 bg-gray-200 rounded-full" />
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-3 bg-tertiary-dark rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />

          <div className="relative z-10 grid grid-cols-5 gap-6">
            {allSteps.map((done, idx) => (
              <div key={idx} className="flex justify-center">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <FaCheckCircle
                    className={`absolute transition-all duration-300 ease-out text-2xl rounded-full p-0.5 ${done ? 'bg-tertiary-dark text-white opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                  />

                  <div
                    className={`absolute w-6 h-6 rounded-full transition-all duration-300 ease-out ${done ? 'opacity-0 scale-75 border-tertiary-dark' : 'bg-white opacity-100 scale-100 border-2 border-tertiary-dark'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6 mt-2">
          <div className="text-center text-sm">
            <div className="font-medium">Account created</div>
            {formattedCreated && <div className="text-xs text-gray-500 mt-1">{formattedCreated}</div>}
          </div>
          <div className="text-center text-sm">
            <div className="font-medium">Profile Image</div>
            <div className="text-xs text-gray-500 mt-1">{profileImageUploaded ? 'Uploaded' : 'Pending'}</div>
          </div>
          <div className="text-center text-sm">
            <div className="font-medium">ID Photo</div>
            <div className="text-xs text-gray-500 mt-1">{idUploaded ? 'Uploaded' : 'Pending'}</div>
          </div>
          <div className="text-center text-sm">
            <div className="font-medium">ID verified</div>
            <div className="text-xs text-gray-500 mt-1">{idVerified ? 'Verified' : 'Pending verification'}</div>
          </div>
          <div className="text-center text-sm">
            <div className="font-medium">Ready to book!</div>
            <div className="text-xs text-gray-500 mt-1">{readyToBook ? 'Ready' : 'Pending'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileProgress;
