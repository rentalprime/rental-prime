import React from "react";
import { useParams } from "react-router-dom";
import MultiStepForm from "../../components/MultiStepForm";

const ListingDetail = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  return <MultiStepForm isEditMode={isEditMode} listingId={id} />;
};

export default ListingDetail;
