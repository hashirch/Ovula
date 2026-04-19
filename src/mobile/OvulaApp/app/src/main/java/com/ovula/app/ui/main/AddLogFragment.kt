package com.ovula.app.ui.main

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.ovula.app.R
import com.ovula.app.data.model.LogRequest
import com.ovula.app.databinding.FragmentAddLogBinding
import com.ovula.app.ui.viewmodel.LogsViewModel
import java.text.SimpleDateFormat
import java.util.*

class AddLogFragment : Fragment() {

    private var _binding: FragmentAddLogBinding? = null
    private val binding get() = _binding!!
    private val viewModel: LogsViewModel by viewModels()
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private var selectedDate: Date = Date()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAddLogBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupViews()
        setupObservers()
        setupClickListeners()
    }

    private fun setupViews() {
        // Set today's date
        binding.etDate.setText(dateFormat.format(selectedDate))
        
        // Setup period status spinner
        val periodStatuses = arrayOf("None", "Period", "Spotting")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, periodStatuses)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerPeriodStatus.adapter = adapter
        
        // Setup mood seekbar
        binding.seekbarMood.setOnSeekBarChangeListener(object : android.widget.SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: android.widget.SeekBar?, progress: Int, fromUser: Boolean) {
                binding.tvMoodValue.text = progress.toString()
            }
            override fun onStartTrackingTouch(seekBar: android.widget.SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: android.widget.SeekBar?) {}
        })
    }

    private fun setupObservers() {
        viewModel.logCreated.observe(viewLifecycleOwner) { success ->
            if (success) {
                Toast.makeText(requireContext(), "Log saved successfully!", Toast.LENGTH_SHORT).show()
                findNavController().navigateUp()
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            Toast.makeText(requireContext(), error, Toast.LENGTH_SHORT).show()
        }

        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            binding.btnSubmit.isEnabled = !isLoading
            binding.btnSubmit.text = if (isLoading) "Saving..." else "Save Log"
        }
    }

    private fun setupClickListeners() {
        binding.etDate.setOnClickListener {
            showDatePicker()
        }

        binding.btnSubmit.setOnClickListener {
            submitLog()
        }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        calendar.time = selectedDate

        DatePickerDialog(
            requireContext(),
            { _, year, month, dayOfMonth ->
                calendar.set(year, month, dayOfMonth)
                selectedDate = calendar.time
                binding.etDate.setText(dateFormat.format(selectedDate))
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun submitLog() {
        val periodStatus = when (binding.spinnerPeriodStatus.selectedItemPosition) {
            1 -> "period"
            2 -> "spotting"
            else -> "none"
        }

        val mood = binding.seekbarMood.progress
        val acne = binding.seekbarAcne.progress
        val pain = binding.seekbarPain.progress

        val sleepHours = binding.etSleepHours.text.toString().toDoubleOrNull()
        val weight = binding.etWeight.text.toString().toDoubleOrNull()
        val notes = binding.etNotes.text.toString().takeIf { it.isNotBlank() }

        val logRequest = LogRequest(
            date = dateFormat.format(selectedDate),
            periodStatus = periodStatus,
            mood = mood,
            acne = acne,
            painLevel = pain,
            sleepHours = sleepHours,
            weight = weight,
            notes = notes
        )

        viewModel.createLog(logRequest)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
