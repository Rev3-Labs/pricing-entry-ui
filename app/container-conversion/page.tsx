"use client";

import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

interface ContainerConversion {
  id: string;
  fromSize: string;
  toSize: string;
  multiplier: string;
}

// Generate container sizes from 1G to 55G
const containerSizes = Array.from({ length: 55 }, (_, i) => `${i + 1}G`);

export default function ContainerConversionPage() {
  const [conversions, setConversions] = useState<ContainerConversion[]>([
    { id: "1", fromSize: "", toSize: "", multiplier: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addConversion = () => {
    const newId = (conversions.length + 1).toString();
    setConversions([
      ...conversions,
      { id: newId, fromSize: "", toSize: "", multiplier: "" },
    ]);
  };

  const removeConversion = (id: string) => {
    if (conversions.length > 1) {
      setConversions(conversions.filter((conv) => conv.id !== id));
    }
  };

  const updateConversion = (
    id: string,
    field: keyof ContainerConversion,
    value: string
  ) => {
    setConversions(
      conversions.map((conv) =>
        conv.id === id ? { ...conv, [field]: value } : conv
      )
    );

    // Clear error when user starts typing
    if (errors[`${id}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    conversions.forEach((conv) => {
      if (!conv.fromSize) {
        newErrors[`${conv.id}-fromSize`] = "From size is required";
      }
      if (!conv.toSize) {
        newErrors[`${conv.id}-toSize`] = "To size is required";
      }
      if (!conv.multiplier) {
        newErrors[`${conv.id}-multiplier`] = "Multiplier is required";
      } else if (
        isNaN(Number(conv.multiplier)) ||
        Number(conv.multiplier) <= 0
      ) {
        newErrors[`${conv.id}-multiplier`] =
          "Multiplier must be a positive number";
      }

      if (conv.fromSize && conv.toSize) {
        const fromIndex = containerSizes.indexOf(conv.fromSize);
        const toIndex = containerSizes.indexOf(conv.toSize);
        if (fromIndex >= toIndex) {
          newErrors[`${conv.id}-toSize`] =
            "To size must be greater than From size";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      console.log("Saving conversions:", conversions);
      // Add your save logic here
    }
  };

  return (
    <div className="relative size-full bg-[#eaeaea] min-h-screen">
      <div className="absolute contents left-0 top-0">
        <div className="bg-[#e0e0e0] h-10 w-full">
          <div
            aria-hidden="true"
            className="absolute border-[#65b230] border-[0px_0px_2px] border-solid inset-0 pointer-events-none"
          />
        </div>

        {/* Header Section */}
        <div className="px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-['Roboto:Medium',_sans-serif] font-medium text-[24px] leading-[36px] text-[#1c1b1f] tracking-[0.25px] mb-4">
                Container Conversion Setup
              </h1>

              {/* Metadata Section */}
              <div className="flex gap-12 mb-4">
                <div className="flex">
                  <div className="w-32">
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#63666a]">
                      Name:
                    </span>
                  </div>
                  <div>
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                      Container Conversion Rules
                    </span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-[143.99px]">
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#63666a]">
                      Last Updated:
                    </span>
                  </div>
                  <div>
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                      {new Date().toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}{" "}
                      {new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-12 mb-4">
                <div className="flex">
                  <div className="w-32">
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#63666a]">
                      Description:
                    </span>
                  </div>
                  <div>
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                      Container size conversion rules for pricing calculations
                    </span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-[143.99px]">
                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#63666a]">
                      Status:
                    </span>
                  </div>
                  <div>
                    <div className="bg-[rgba(101,178,48,0.1)] px-3 py-1 rounded-[50px]">
                      <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="bg-[#65b230] px-6 py-2 rounded-[100px] hover:bg-[#5a9e2a] transition-colors"
            >
              <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#ffffff] tracking-[0.1px] uppercase">
                Save
              </span>
            </button>
          </div>

          {/* Table Section */}
          <div className="bg-white border border-[#b9b9b9] rounded shadow-sm">
            {/* Table Header with Add Button */}
            <div className="p-6 border-b border-[#b9b9b9]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[27px] text-[#1c1b1f] mb-2">
                    Container Size Conversion Configuration
                  </h2>
                  <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[24px] text-[#1c1b1f]">
                    Container Size Ranges
                  </h3>
                </div>
                <button
                  onClick={addConversion}
                  className="bg-[#65b230] flex items-center gap-2 h-9 px-3 py-2 rounded-[100px] hover:bg-[#5a9e2a] transition-colors"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#ffffff] tracking-[0.1px] uppercase">
                    Add Range
                  </span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.06)] border-b border-[#b9b9b9]">
                    <th className="font-['Roboto:SemiBold',_sans-serif] font-semibold text-[13px] leading-[0] text-[#000000] py-[14.38px] px-6 text-left">
                      From Size
                    </th>
                    <th className="font-['Roboto:SemiBold',_sans-serif] font-semibold text-[13px] leading-[0] text-[#000000] py-[14.38px] px-6 text-left">
                      To Size
                    </th>
                    <th className="font-['Roboto:SemiBold',_sans-serif] font-semibold text-[13px] leading-[0] text-[#000000] py-[14.38px] px-6 text-left">
                      Multiplier
                    </th>
                    <th className="font-['Roboto:SemiBold',_sans-serif] font-semibold text-[13px] leading-[0] text-[#000000] py-[14.38px] px-6 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {conversions.map((conversion, index) => (
                    <tr
                      key={conversion.id}
                      className="border-b border-[#b9b9b9] last:border-b-0"
                    >
                      <td className="py-[26.27px] px-6">
                        <select
                          value={conversion.fromSize}
                          onChange={(e) =>
                            updateConversion(
                              conversion.id,
                              "fromSize",
                              e.target.value
                            )
                          }
                          className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#000000] bg-transparent border-none outline-none w-full"
                        >
                          <option value="">Select size</option>
                          {containerSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        {errors[`${conversion.id}-fromSize`] && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors[`${conversion.id}-fromSize`]}
                          </div>
                        )}
                      </td>
                      <td className="py-[26.27px] px-6">
                        <select
                          value={conversion.toSize}
                          onChange={(e) =>
                            updateConversion(
                              conversion.id,
                              "toSize",
                              e.target.value
                            )
                          }
                          className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#000000] bg-transparent border-none outline-none w-full"
                        >
                          <option value="">Select size</option>
                          {containerSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        {errors[`${conversion.id}-toSize`] && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors[`${conversion.id}-toSize`]}
                          </div>
                        )}
                      </td>
                      <td className="py-[26.27px] px-6">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={conversion.multiplier}
                          onChange={(e) =>
                            updateConversion(
                              conversion.id,
                              "multiplier",
                              e.target.value
                            )
                          }
                          placeholder="1.00"
                          className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#000000] bg-transparent border-none outline-none w-full"
                        />
                        {errors[`${conversion.id}-multiplier`] && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors[`${conversion.id}-multiplier`]}
                          </div>
                        )}
                      </td>
                      <td className="py-[26.27px] px-6">
                        <div className="flex gap-2">
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          {conversions.length > 1 && (
                            <button
                              onClick={() => removeConversion(conversion.id)}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer - Pagination */}
            <div className="bg-[#ffffff] flex items-center justify-between h-[58px] px-6 border-t border-[#b9b9b9]">
              <div className="flex items-center gap-2">
                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[20px] text-[rgba(0,0,0,0.87)] tracking-[0.4px]">
                  Showing 1 to {conversions.length} of {conversions.length}{" "}
                  entries
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[12px] leading-[0] text-[#000000]">
                    Show
                  </span>
                  <div className="bg-[#ffffff] h-[23px] w-[51.684px] border border-[#e4e4e4] flex items-center justify-center">
                    <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[12px] leading-[0] text-[#000000]">
                      {conversions.length}
                    </span>
                  </div>
                  <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[12px] leading-[0] text-[#000000]">
                    entries
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#999999] hover:text-[#333333] transition-colors">
                    First
                  </button>
                  <button className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#999999] hover:text-[#333333] transition-colors">
                    Previous
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-[#65b230] text-white font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0]">
                    1
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#333333] hover:bg-gray-100">
                    2
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#333333] hover:bg-gray-100">
                    3
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#333333] hover:bg-gray-100">
                    4
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#333333] hover:bg-gray-100">
                    5
                  </button>
                  <button className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#333333] hover:text-[#999999] transition-colors">
                    Next
                  </button>
                  <button className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[0] text-[#333333] hover:text-[#999999] transition-colors">
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
