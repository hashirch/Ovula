package com.ovula.app.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.ovula.app.databinding.FragmentPcosPredictionBinding
import com.ovula.app.ui.viewmodel.PredictionViewModel

class PCOSPredictionFragment : Fragment() {

    private var _binding: FragmentPcosPredictionBinding? = null
    private val binding get() = _binding!!
    private val viewModel: PredictionViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPcosPredictionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupObservers()
        setupClickListeners()
        viewModel.fetchHealthProfile()
    }

    private fun setupObservers() {
        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressLoading.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.btnPredict.isEnabled = !isLoading
        }

        viewModel.healthProfile.observe(viewLifecycleOwner) { profile ->
            binding.layoutNoProfile.visibility = View.GONE
            binding.layoutHasProfile.visibility = View.VISIBLE
        }

        viewModel.prediction.observe(viewLifecycleOwner) { prediction ->
            binding.layoutResult.visibility = View.VISIBLE
            binding.tvPrediction.text = prediction.prediction
            binding.tvRiskScore.text = String.format("%.1f%%", prediction.riskScore * 100)
            binding.tvConfidence.text = String.format("%.1f%%", prediction.confidence * 100)
            
            val recommendationsText = prediction.recommendations?.joinToString("\n\n") { "• $it" } ?: "No recommendations"
            binding.tvRecommendations.text = recommendationsText
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            Toast.makeText(requireContext(), error, Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupClickListeners() {
        binding.btnPredict.setOnClickListener {
            viewModel.predict()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
