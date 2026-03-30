package uth.nhathuy.User.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequest {

    @NotBlank
    @Size(max = 150)
    private String receiverName;

    @NotBlank
    @Size(max = 20)
    private String receiverPhone;

    @NotBlank
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @NotBlank
    @Size(max = 100)
    private String ward;

    @NotBlank
    @Size(max = 100)
    private String district;

    @NotBlank
    @Size(max = 100)
    private String province;

    @Size(max = 20)
    private String postalCode;

    private Boolean isDefault = false;
}