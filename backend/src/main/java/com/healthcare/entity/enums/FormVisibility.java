package com.healthcare.entity.enums;

/**
 * Form visibility control levels
 * Determines who can see and fill the form
 */
public enum FormVisibility {
    /**
     * PUBLIC: Any authenticated user can view (requires publicForm=true)
     * Visible on public forms page, can be filled by patients or on-behalf by doctors
     */
    PUBLIC,

    /**
     * DOCTOR_ONLY: Only the creating doctor can view/edit/fill
     * Not visible to patients, used for internal workflows
     */
    DOCTOR_ONLY,

    /**
     * PRIVATE: Only the creating doctor, associated patients, and ADMIN can view
     * Can be filled by patients via link or via doctor on-behalf
     */
    PRIVATE;

    public boolean isPublic() {
        return this == PUBLIC;
    }

    public boolean isDoesNeedPublish() {
        return this == PUBLIC;
    }
}
