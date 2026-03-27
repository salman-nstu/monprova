
    <div>
        <label className="label-text font-semibold mb-1">বিশেষজ্ঞ</label>
        <select
            value={specialist}
            onChange={(e) => setSpecialist(e.target.value)}
            disabled={!isEditable}
            className="select select-bordered w-full border-2 p-2"
        >
            <option value="">নির্বাচন করুন</option>
            <option value="psychologist">সাইকোলজিস্ট</option>
            <option value="psychiatrist">সাইকিয়াট্রিস্ট</option>
        </select>
    </div>

    <div>
                            <label className="label-text font-semibold mb-1">বিশেষ দক্ষতা</label>
                            <input
                                type="text"
                                name="expertise"
                                defaultValue={doctorInfo?.expertise || ''} // Default to empty if undefined
                                disabled={!isEditable}
                                className="input input-bordered w-full border-2 p-2"
                            />
                        </div>


<div>
                            <label className="label-text font-semibold mb-1">পরামর্শ ফি (টাকা)</label>
                            <input
                                type="number"
                                name="consultationFee"
                                defaultValue={doctorInfo?.consultationFee || ''} // Default to empty if undefined
                                disabled={!isEditable}
                                className="input input-bordered w-full border-2 p-2"
                                required
                            />
                        </div>