import React from 'react';

const Description = ({ description }: { description: string }) => {
  return (
    <>
      <div className="description-content">
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: description }}
        ></div>
      </div>
    </>
  );
};

export default Description;
